import { Request, Response } from 'express';
import { chain, cloneDeep, flatMap, isEmpty, some, uniq } from 'lodash';
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

import { AccountFca, AccountFcaService } from '@fc/account-fca';
import { validateDto } from '@fc/common';
import { ConfigService } from '@fc/config';
import {
  CoreConfig,
  CoreIdpHintException,
  CoreRoutes,
  Interaction,
} from '@fc/core';
import { CoreAcrNotSatisfiedException } from '@fc/core/exceptions/core-acr-not-satisfied.exception';
import { CoreLoginRequiredException } from '@fc/core/exceptions/core-login-required.exception';
import { UserSessionDecorator } from '@fc/core-fca/decorators';
import { CoreFcaRoutes } from '@fc/core-fca/enums/core-fca-routes.enum';
import {
  CoreFcaAgentAccountBlockedException,
  CoreFcaAgentNotFromPublicServiceException,
} from '@fc/core-fca/exceptions';
import { IAgentIdentity } from '@fc/core-fca/interfaces';
import { CsrfService } from '@fc/csrf';
import { AuthorizeStepFrom, SetStep } from '@fc/flow-steps';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { standardJwtClaims } from '@fc/jwt';
import { NotificationsService } from '@fc/notifications';
import { IOidcIdentity } from '@fc/oidc';
import { OidcAcrService, SimplifiedInteraction } from '@fc/oidc-acr';
import { OidcClientRoutes } from '@fc/oidc-client';
import {
  OidcProviderConfig,
  OidcProviderRoutes,
  OidcProviderService,
} from '@fc/oidc-provider';
import { ServiceProviderAdapterMongoService } from '@fc/service-provider-adapter-mongo';
import { ISessionService, SessionService } from '@fc/session';
import {
  Track,
  TrackedEventContextInterface,
  TrackingService,
} from '@fc/tracking';

import {
  ActiveUserSessionDto,
  AppConfig,
  GetVerifySessionDto,
  UserSession,
} from '../dto';
import { CoreFcaFqdnService, CoreFcaService } from '../services';

@Controller()
export class InteractionController {
  // More than 4 parameters authorized for a controller
  /* eslint-disable-next-line max-params */
  constructor(
    private readonly accountService: AccountFcaService,
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

    const activeSessionValidationErrors = await validateDto(
      userSession.get(),
      ActiveUserSessionDto,
      {},
    );

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
      subs,
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

    const account = await this.getOrCreateAccount(idpId, idpIdentity.sub);

    const newIdentity = cloneDeep(idpIdentity);
    const newIdentityWithCustomProperty =
      this.moveUnknownClaimsToCustomProperty(newIdentity);
    const spIdentity = chain(newIdentityWithCustomProperty)
      .omit('sub')
      .set('idp_id', idpId)
      .set('idp_acr', idpAcr)
      .value() as IAgentIdentity;
    const session: UserSession = {
      spIdentity,
      accountId: account.id,
      interactionAcr,
      subs: { ...subs, [spId]: account.sub },
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

  async getOrCreateAccount(
    idpUid: string,
    idpSub: string,
  ): Promise<AccountFca> {
    const idpAgentKeys = { idpUid, idpSub };
    let account =
      await this.accountService.getAccountByIdpAgentKeys(idpAgentKeys);
    if (!account) {
      account = this.accountService.createAccount();
    }
    if (!account.active) {
      throw new CoreFcaAgentAccountBlockedException();
    }

    if (!some(account.idpIdentityKeys, idpAgentKeys)) {
      account.idpIdentityKeys.push(idpAgentKeys);
    }

    account.lastConnection = new Date();

    await this.accountService.upsertWithSub(account);

    return account;
  }

  // All unknown properties from idp identity are moved to "custom" property
  moveUnknownClaimsToCustomProperty(
    identity: Partial<IOidcIdentity>,
  ): IAgentIdentity {
    /*
     * Some IdPs may return a "custom" field in the userinfo response.
     *
     * In FCA, we use the "custom" field as a catch-all to store any unexpected values,
     * which leads FCA to assume that the "custom" property is part of the FCA identity by default.
     *
     * However, this is not the case, and we need to include the IdP's "custom" content
     * within the FCA's "custom" field for user info.
     *
     * Therefore, when an IdP provides a "custom" property, we will store its content
     * within a sub-property under FCA's "custom" field.
     * Example: { custom: { custom: "some content" } }
     */
    const { configuration } =
      this.config.get<OidcProviderConfig>('OidcProvider');
    const expectedClaims = uniq(
      flatMap(configuration.claims, (claims) => claims),
    );
    const knownClaims = expectedClaims
      .concat(standardJwtClaims)
      .filter((claim) => {
        return claim !== 'custom';
      });

    const [customizedIdentity, custom] = Object.entries(identity).reduce<
      [IAgentIdentity, Record<string, unknown>]
    >(
      ([accCustomized, accCustom], [key, value]) => {
        return knownClaims.includes(key)
          ? [{ ...accCustomized, [key]: value }, accCustom] // Add to customizedIdentity
          : [accCustomized, { ...accCustom, [key]: value }]; // Add to custom
      },
      [{} as IAgentIdentity, {}],
    );

    return {
      ...customizedIdentity,
      custom,
    };
  }
}
