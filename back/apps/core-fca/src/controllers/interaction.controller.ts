import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Request, Response } from 'express';
import { isEmpty } from 'lodash';
import { v4 as uuid } from 'uuid';

import {
  Controller,
  Get,
  Header,
  Param,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { ConfigService } from '@fc/config';
import {
  CoreConfig,
  CoreIdpHintException,
  CoreRoutes,
  Interaction,
} from '@fc/core';
import { CsrfService } from '@fc/csrf';
import { AuthorizeStepFrom, SetStep } from '@fc/flow-steps';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { NotificationsService } from '@fc/notifications';
import { OidcAcrService, SimplifiedInteraction } from '@fc/oidc-acr';
import { OidcClientRoutes } from '@fc/oidc-client';
import { OidcProviderRoutes, OidcProviderService } from '@fc/oidc-provider';
import { ServiceProviderAdapterMongoService } from '@fc/service-provider-adapter-mongo';
import { ISessionService, SessionService } from '@fc/session';
import {
  Track,
  TrackedEventContextInterface,
  TrackingService,
} from '@fc/tracking';

import { UserSessionDecorator } from '../decorators';
import {
  ActiveUserSessionDto,
  AppConfig,
  GetVerifySessionDto,
  UserSession,
} from '../dto';
import { CoreFcaRoutes } from '../enums/core-fca-routes.enum';
import {
  CoreAcrNotSatisfiedException,
  CoreFcaAgentNotFromPublicServiceException,
  CoreLoginRequiredException,
} from '../exceptions';
import { CoreFcaFqdnService, CoreFcaService } from '../services';

@Controller()
export class InteractionController {
  // More than 4 parameters authorized for a controller
  /* eslint-disable-next-line max-params */
  constructor(
    private readonly oidcProvider: OidcProviderService,
    private readonly oidcAcr: OidcAcrService,
    private readonly identityProvider: IdentityProviderAdapterMongoService,
    private readonly serviceProvider: ServiceProviderAdapterMongoService,
    private readonly config: ConfigService,
    private readonly notifications: NotificationsService,
    private readonly fqdnService: CoreFcaFqdnService,
    private readonly tracking: TrackingService,
    private readonly sessionService: SessionService,
    private readonly coreFca: CoreFcaService,
    private readonly csrfService: CsrfService,
  ) {}

  @Get(CoreRoutes.DEFAULT)
  @Header('cache-control', 'no-store')
  getDefault(@Res() res) {
    const { defaultRedirectUri } = this.config.get<CoreConfig>('Core');
    res.redirect(301, defaultRedirectUri);
  }

  @Get(CoreRoutes.INTERACTION)
  @Header('cache-control', 'no-store')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @AuthorizeStepFrom([
    OidcProviderRoutes.AUTHORIZATION, // Standard flow
    CoreRoutes.INTERACTION, // Refresh
    OidcClientRoutes.OIDC_CALLBACK, // Back on error
    CoreRoutes.INTERACTION_VERIFY, // Back on error
    CoreFcaRoutes.INTERACTION_IDENTITY_PROVIDER_SELECTION, // Client is choosing an identity provider
    OidcClientRoutes.REDIRECT_TO_IDP, // Browser back button
  ])
  @SetStep()
  // eslint-disable-next-line complexity
  async getInteraction(
    @Req() req,
    @Res() res: Response,
    @Param() _params: Interaction,
    @UserSessionDecorator()
    userSession: ISessionService<UserSession>,
  ): Promise<void> {
    const interaction: SimplifiedInteraction =
      await this.oidcProvider.getInteraction(req, res);

    const {
      uid: interactionId,
      params: {
        client_id: spId,
        state: spState,
        idp_hint: idpHint,
        login_hint: loginHint,
      },
    } = interaction;

    const activeUserSession = plainToInstance(
      ActiveUserSessionDto,
      userSession.get(),
    );
    const activeSessionValidationErrors = await validate(activeUserSession);

    const isUserConnectedAlready = isEmpty(activeSessionValidationErrors);

    if (isUserConnectedAlready) {
      // The session is duplicated here to mitigate cookie-theft-based attacks.
      // For more information, refer to: https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/1288
      await userSession.duplicate();
    } else {
      await userSession.reset();
      userSession.set({ browsingSessionId: uuid() });
    }

    const hintedIdp = await this.identityProvider.getById(idpHint);
    if (idpHint && isEmpty(hintedIdp)) {
      throw new CoreIdpHintException();
    }

    const isSessionOpenedWithHintedIdp =
      !idpHint || userSession.get('idpId') === hintedIdp.uid;

    const isEssentialAcrSatisfied =
      this.oidcAcr.isEssentialAcrSatisfied(interaction);

    const canReuseActiveSession =
      isUserConnectedAlready &&
      isSessionOpenedWithHintedIdp &&
      isEssentialAcrSatisfied;

    const { name: spName } = await this.serviceProvider.getById(spId);

    const { acrClaims } =
      this.oidcAcr.getFilteredAcrParamsFromInteraction(interaction);
    const spEssentialAcr =
      acrClaims?.value || acrClaims?.values.join(' ') || null;

    userSession.set({
      interactionId,
      spEssentialAcr,
      spId,
      spName,
      spState,
      reusesActiveSession: canReuseActiveSession,
    });
    await userSession.commit();

    const eventContext: TrackedEventContextInterface = {
      fc: { interactionId },
      req,
      sessionId: req.sessionId,
    };

    const { FC_AUTHORIZE_INITIATED } = this.tracking.TrackedEventsMap;
    await this.tracking.track(FC_AUTHORIZE_INITIATED, eventContext);

    if (canReuseActiveSession) {
      const { FC_SSO_INITIATED } = this.tracking.TrackedEventsMap;
      await this.tracking.track(FC_SSO_INITIATED, eventContext);

      const { urlPrefix } = this.config.get<AppConfig>('App');
      const url = `${urlPrefix}${CoreRoutes.INTERACTION_VERIFY.replace(
        ':uid',
        interactionId,
      )}`;

      return res.redirect(url);
    }

    if (idpHint) {
      const { FC_REDIRECTED_TO_HINTED_IDP } = this.tracking.TrackedEventsMap;
      await this.tracking.track(FC_REDIRECTED_TO_HINTED_IDP, eventContext);

      return this.coreFca.redirectToIdp(req, res, idpHint);
    }

    const fqdn = this.fqdnService.getFqdnFromEmail(loginHint);
    const { FC_SHOWED_IDP_CHOICE } = this.tracking.TrackedEventsMap;
    await this.tracking.track(FC_SHOWED_IDP_CHOICE, { ...eventContext, fqdn });

    const notification = await this.notifications.getNotificationToDisplay();
    const { defaultEmailRenater } = this.config.get<AppConfig>('App');

    const csrfToken = this.csrfService.renew();
    this.sessionService.set('Csrf', { csrfToken });

    res.render('interaction', {
      csrfToken,
      defaultEmailRenater,
      notification,
      spName,
      loginHint,
    });
  }

  @Get(CoreRoutes.INTERACTION_VERIFY)
  @Header('cache-control', 'no-store')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @AuthorizeStepFrom([
    OidcClientRoutes.OIDC_CALLBACK, // Standard cinematic
    CoreRoutes.INTERACTION, // Reuse of an existing session
  ])
  @SetStep()
  // Note: The FC_REDIRECTED_TO_SP event is logged regardless of whether Panva's oidc-provider
  // successfully redirects to the service provider or encounters an error
  @Track('FC_REDIRECTED_TO_SP')
  // eslint-disable-next-line complexity
  async getVerify(
    @Req() req: Request,
    @Res() res: Response,
    @Param() _params: Interaction,
    @UserSessionDecorator(GetVerifySessionDto)
    userSessionService: ISessionService<UserSession>,
  ) {
    const {
      amr,
      idpAcr,
      idpId,
      idpIdentity,
      interactionId,
      isSilentAuthentication,
      spEssentialAcr,
      spId,
    } = userSessionService.get();

    const isIdpActive = await this.identityProvider.isActiveById(idpId);
    if (!isIdpActive) {
      if (isSilentAuthentication) {
        throw new CoreLoginRequiredException();
      }

      const { urlPrefix } = this.config.get<AppConfig>('App');

      await this.trackIdpDisabled(req);

      const url = `${urlPrefix}${CoreRoutes.INTERACTION.replace(
        ':uid',
        interactionId,
      )}`;
      return res.redirect(url);
    }

    const { type: spType } = await this.serviceProvider.getById(spId);
    // is_service_public field is only provided by ProConnect Identité
    // any identity without an is_service_public field is considered to be from the public sector
    const isPrivateSectorIdentity = idpIdentity?.is_service_public === false;
    const doesNotAcceptPrivateSectorEmployees = spType === 'public';

    if (isPrivateSectorIdentity && doesNotAcceptPrivateSectorEmployees) {
      throw new CoreFcaAgentNotFromPublicServiceException();
    }

    const interactionAcr = this.oidcAcr.getInteractionAcr({
      idpAcr,
      spEssentialAcr,
    });

    if (!interactionAcr) {
      throw new CoreAcrNotSatisfiedException();
    }

    const session: UserSession = {
      interactionAcr,
    };
    userSessionService.set(session);

    return this.oidcProvider.finishInteraction(req, res, {
      amr,
      acr: interactionAcr,
    });
  }

  async trackIdpDisabled(req: Request) {
    const eventContext = { req };
    const { FC_IDP_DISABLED } = this.tracking.TrackedEventsMap;

    await this.tracking.track(FC_IDP_DISABLED, eventContext);
  }
}
