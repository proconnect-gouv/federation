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

import { validateDto } from '@fc/common';
import { ConfigService } from '@fc/config';
import {
  CoreConfig,
  CoreIdpHintException,
  CoreRoutes,
  CoreVerifyService,
  Interaction,
} from '@fc/core';
import { UserSessionDecorator } from '@fc/core-fca/decorators';
import { CoreFcaRoutes } from '@fc/core-fca/enums/core-fca-routes.enum';
import { CsrfService } from '@fc/csrf';
import { AuthorizeStepFrom, SetStep } from '@fc/flow-steps';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { NotificationsService } from '@fc/notifications';
import { OidcClientRoutes } from '@fc/oidc-client';
import { OidcProviderRoutes, OidcProviderService } from '@fc/oidc-provider';
import { ServiceProviderAdapterMongoService } from '@fc/service-provider-adapter-mongo';
import { ISessionService, SessionService } from '@fc/session';
import { TrackedEventContextInterface, TrackingService } from '@fc/tracking';

import {
  ActiveUserSessionDto,
  AppConfig,
  GetVerifySessionDto,
  UserSession,
} from '../dto';
import {
  CoreFcaFqdnService,
  CoreFcaService,
  CoreFcaVerifyService,
} from '../services';

@Controller()
export class InteractionController {
  // More than 4 parameters authorized for a controller
  /* eslint-disable-next-line max-params */
  constructor(
    private readonly oidcProvider: OidcProviderService,
    private readonly identityProvider: IdentityProviderAdapterMongoService,
    private readonly serviceProvider: ServiceProviderAdapterMongoService,
    private readonly config: ConfigService,
    private readonly notifications: NotificationsService,
    private readonly fqdnService: CoreFcaFqdnService,
    private readonly coreFcaVerify: CoreFcaVerifyService,
    private readonly coreVerify: CoreVerifyService,
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
    const {
      uid: interactionId,
      params: {
        acr_values: spAcr,
        client_id: spId,
        redirect_uri: spRedirectUri,
        state,
        idp_hint: idpHint,
        login_hint: loginHint,
      },
    }: { uid: string; params: { [k: string]: string } } =
      await this.oidcProvider.getInteraction(req, res);

    const activeSessionValidationErrors = await validateDto(
      userSession.get(),
      ActiveUserSessionDto,
      {},
    );

    const isUserConnectedAlready = activeSessionValidationErrors.length <= 0;

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

    const canReuseActiveSession =
      isUserConnectedAlready && isSessionOpenedWithHintedIdp;

    const { name: spName } = await this.serviceProvider.getById(spId);

    userSession.set({
      interactionId,
      spAcr: spAcr,
      spId: spId,
      spRedirectUri: spRedirectUri,
      spName,
      spState: state,
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

      return this.coreFca.redirectToIdp(res, idpHint, { acr_values: spAcr });
    }

    const fqdn = this.fqdnService.getFqdnFromEmail(loginHint ?? '');
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
    CoreRoutes.INTERACTION, // Reuse of existing session
  ])
  @SetStep()
  async getVerify(
    @Req() req: Request,
    @Res() res: Response,
    @Param() _params: Interaction,
    @UserSessionDecorator(GetVerifySessionDto)
    userSession: ISessionService<UserSession>,
  ) {
    const { idpId, interactionId, spRedirectUri, isSilentAuthentication } =
      userSession.get();

    const { urlPrefix } = this.config.get<AppConfig>('App');
    const params = { urlPrefix, interactionId, sessionOidc: userSession };
    const isIdpActive = await this.identityProvider.isActiveById(idpId);

    if (!isIdpActive) {
      if (isSilentAuthentication) {
        const url = this.coreFcaVerify.handleErrorLoginRequired(spRedirectUri);
        return res.redirect(url);
      }
      const url = await this.coreVerify.handleUnavailableIdp(
        req,
        params,
        !isIdpActive,
      );
      return res.redirect(url);
    }

    const url = await this.coreFcaVerify.handleVerifyIdentity(req, params);
    return res.redirect(url);
  }
}
