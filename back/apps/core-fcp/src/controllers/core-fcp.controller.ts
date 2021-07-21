import { ValidationError } from 'class-validator';
import {
  Controller,
  Post,
  Get,
  Render,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
  Param,
  Body,
  Type,
} from '@nestjs/common';
import { OidcSession } from '@fc/oidc';
import { OidcProviderService, OidcProviderConfig } from '@fc/oidc-provider';
import { LoggerLevelNames, LoggerService } from '@fc/logger';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import {
  ISessionService,
  Session,
  SessionCsrfService,
  SessionInvalidCsrfConsentException,
  SessionNotFoundException,
  SessionService,
} from '@fc/session';
import { OidcClientSession } from '@fc/oidc-client';
import { ConfigService } from '@fc/config';
import { AppConfig } from '@fc/app';
import {
  Interaction,
  CsrfToken,
  CoreRoutes,
  CoreMissingIdentityException,
} from '@fc/core';
import { CryptographyService } from '@fc/cryptography';
import { NotificationsService } from '@fc/notifications';
import { TrackingService } from '@fc/tracking';
import { ServiceProviderAdapterMongoService } from '@fc/service-provider-adapter-mongo';
import {
  GetOidcCallback,
  OidcClientConfig,
  OidcClientRoutes,
  OidcClientService,
} from '@fc/oidc-client';
import { Core, OidcIdentityDto } from '../dto';
import { CoreFcpService } from '../services';
import { ProcessCore } from '../enums';
import {
  CoreFcpInvalidIdentityException,
  CoreFcpInvalidEventClassException,
} from '../exceptions';
import {
  CoreFcpDatatransferConsentIdentityEvent,
  CoreFcpDatatransferInformationAnonymousEvent,
  CoreFcpDatatransferInformationIdentityEvent,
} from '../events';

export const datatransferEventsMap = {
  'INFORMATION:ANONYMOUS': CoreFcpDatatransferInformationAnonymousEvent,
  'INFORMATION:IDENTITY': CoreFcpDatatransferInformationIdentityEvent,
  'CONSENT:IDENTITY': CoreFcpDatatransferConsentIdentityEvent,
};
@Controller()
export class CoreFcpController {
  // Dependency injection can require more than 4 parameters
  /* eslint-disable-next-line max-params */
  constructor(
    private readonly logger: LoggerService,
    private readonly oidcProvider: OidcProviderService,
    private readonly identityProvider: IdentityProviderAdapterMongoService,
    private readonly serviceProvider: ServiceProviderAdapterMongoService,
    private readonly core: CoreFcpService,
    private readonly config: ConfigService,
    private readonly crypto: CryptographyService,
    private readonly notifications: NotificationsService,
    private readonly oidcClient: OidcClientService,
    private readonly tracking: TrackingService,
    private readonly sessionService: SessionService,
    private readonly csrfService: SessionCsrfService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  @Get(CoreRoutes.DEFAULT)
  getDefault(@Res() res) {
    const { defaultRedirectUri } = this.config.get<Core>('Core');

    this.logger.trace({
      route: CoreRoutes.DEFAULT,
      method: 'GET',
      name: 'CoreRoutes.DEFAULT',
      redirect: defaultRedirectUri,
    });

    res.redirect(301, defaultRedirectUri);
  }

  @Get(CoreRoutes.INTERACTION)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getInteraction(
    @Req() req,
    @Res() res,
    @Param() _params: Interaction,
    /**
     * @todo Adaptation for now, correspond to the oidc-provider side.
     * Named "OidcClient" because we need a future shared session between our libs oidc-provider and oidc-client
     * without a direct dependance like now.
     * @author Hugues
     * @date 2021-04-16
     * @ticket FC-xxx
     */
    @Session('OidcClient')
    sessionOidc: ISessionService<OidcClientSession>,
  ) {
    const session = await sessionOidc.get();
    if (!session) {
      throw new SessionNotFoundException('OidcClient');
    }

    const { spName } = session;
    const { uid, params } = await this.oidcProvider.getInteraction(req, res);
    const { scope } = this.config.get<OidcClientConfig>('OidcClient');
    const { client_id: clientId, acr_values: acrValues } = params;

    const {
      configuration: { acrValues: allowedAcrValues },
    } = this.config.get<OidcProviderConfig>('OidcProvider');

    const rejected = await this.core.rejectInvalidAcr(
      acrValues,
      allowedAcrValues,
      { req, res },
    );

    if (rejected) {
      this.logger.trace(
        { rejected, acrValues, allowedAcrValues },
        LoggerLevelNames.WARN,
      );
      return;
    }

    const { idpFilterExclude, idpFilterList } =
      await this.serviceProvider.getById(clientId);

    const providers = await this.identityProvider.getFilteredList(
      idpFilterList,
      idpFilterExclude,
    );

    // -- generate and store in session the CSRF token
    const csrfToken = this.csrfService.get();
    await this.csrfService.save(sessionOidc, csrfToken);

    const notifications = await this.notifications.getNotifications();
    const response = {
      uid,
      params,
      scope,
      providers,
      notifications,
      spName,
      csrfToken,
    };

    this.logger.trace({
      route: CoreRoutes.INTERACTION,
      method: 'GET',
      name: 'CoreRoutes.INTERACTION',
      response,
    });

    return res.render('interaction', response);
  }

  @Get(CoreRoutes.INTERACTION_VERIFY)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getVerify(
    @Req() req,
    @Res() res,
    @Param() _params: Interaction,
    /**
     * @todo Adaptation for now, correspond to the oidc-provider side.
     * Named "OidcClient" because we need a future shared session between our libs oidc-provider and oidc-client
     * without a direct dependance like now.
     * @author Hugues
     * @date 2021-04-16
     * @ticket FC-xxx
     */
    @Session('OidcClient')
    sessionOidc: ISessionService<OidcClientSession>,
  ) {
    const { interactionId } = await sessionOidc.get();
    await this.core.verify(sessionOidc, req);

    const { urlPrefix } = this.config.get<AppConfig>('App');
    const url = `${urlPrefix}/interaction/${interactionId}/consent`;

    this.logger.trace({
      route: CoreRoutes.INTERACTION_VERIFY,
      method: 'GET',
      name: 'CoreRoutes.INTERACTION_VERIFY',
      redirect: url,
    });

    res.redirect(url);
  }

  @Get(CoreRoutes.INTERACTION_CONSENT)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Render('consent')
  async getConsent(
    @Req() req,
    @Res() res,
    @Param() _params: Interaction,
    /**
     * @todo Adaptation for now, correspond to the oidc-provider side.
     * Named "OidcClient" because we need a future shared session between our libs oidc-provider and oidc-client
     * without a direct dependance like now.
     * @author Hugues
     * @date 2021-04-16
     * @ticket FC-xxx
     */
    @Session('OidcClient')
    sessionOidc: ISessionService<OidcClientSession>,
  ) {
    const {
      spIdentity: identity,
      spName,
      spId,
      interactionId,
    }: OidcSession = await sessionOidc.get();

    const interaction = await this.oidcProvider.getInteraction(req, res);

    const scopes = await this.core.getScopesForInteraction(interaction);
    const claims = await this.core.getClaimsLabelsForInteraction(interaction);
    const consentRequired = await this.core.isConsentRequired(spId);

    // -- generate and store in session the CSRF token
    const csrfToken = await this.csrfService.get();
    await this.csrfService.save(sessionOidc, csrfToken);

    const response = {
      interactionId,
      identity,
      spName,
      scopes,
      claims,
      csrfToken,
      consentRequired,
    };

    this.logger.trace({
      route: CoreRoutes.INTERACTION_CONSENT,
      method: 'GET',
      name: 'CoreRoutes.INTERACTION_CONSENT',
      response,
    });

    return response;
  }

  private getEventClass(
    scopes: string[],
    consentRequired: boolean,
  ): Type<
    | CoreFcpDatatransferConsentIdentityEvent
    | CoreFcpDatatransferInformationAnonymousEvent
    | CoreFcpDatatransferInformationIdentityEvent
  > {
    const dataType = scopes.every((scope) => scope === 'openid')
      ? 'ANONYMOUS'
      : 'IDENTITY';
    const consentOrInfo = consentRequired ? 'CONSENT' : 'INFORMATION';

    const classMapKey = `${consentOrInfo}:${dataType}`;

    if (!(classMapKey in datatransferEventsMap)) {
      throw new CoreFcpInvalidEventClassException();
    }

    return datatransferEventsMap[classMapKey];
  }

  private async trackDatatransfer(
    trackingContext,
    interaction: any,
    spId: string,
  ): Promise<void> {
    const scopes = await this.core.getScopesForInteraction(interaction);
    const consentRequired = await this.core.isConsentRequired(spId);
    const claims = await this.core.getClaimsForInteraction(interaction);

    const eventClass = this.getEventClass(scopes, consentRequired);
    const context = {
      ...trackingContext,
      claims,
    };

    this.tracking.track(eventClass, context);
  }

  @Post(CoreRoutes.INTERACTION_LOGIN)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getLogin(
    @Req() req,
    @Res() res,
    @Body() body: CsrfToken,
    /**
     * @todo Adaptation for now, correspond to the oidc-provider side.
     * Named "OidcClient" because we need a future shared session between our libs oidc-provider and oidc-client
     * without a direct dependance like now.
     * @author Hugues
     * @date 2021-04-16
     * @ticket FC-xxx
     */
    @Session('OidcClient')
    sessionOidc: ISessionService<OidcClientSession>,
  ) {
    const { _csrf: csrfToken } = body;
    const session: OidcSession = await sessionOidc.get();

    if (!session) {
      throw new SessionNotFoundException('OidcClient');
    }

    const { spId, spIdentity } = session;

    try {
      await this.csrfService.validate(sessionOidc, csrfToken);
    } catch (error) {
      this.logger.trace({ error }, LoggerLevelNames.WARN);
      throw new SessionInvalidCsrfConsentException(error);
    }

    if (!spIdentity) {
      this.logger.trace({ spIdentity }, LoggerLevelNames.WARN);
      throw new CoreMissingIdentityException();
    }

    this.logger.trace({ csrfToken, spIdentity });

    const interaction = await this.oidcProvider.getInteraction(req, res);
    const trackingContext = req;
    await this.trackDatatransfer(trackingContext, interaction, spId);

    // send the notification mail to the final user
    await this.core.sendAuthenticationMail(session);

    /**
     * We need to set an alias with the sub since later (findAccount) we do not have access
     * to the sessionId, nor the interactionId.
     */
    await this.sessionService.setAlias(spIdentity.sub, req.sessionId);

    this.logger.trace({
      route: CoreRoutes.INTERACTION_LOGIN,
      method: 'POST',
      name: 'CoreRoutes.INTERACTION_LOGIN',
      data: { req, res, session },
    });

    return this.oidcProvider.finishInteraction(req, res, session);
  }

  /**
   * @TODO #308 ETQ DEV je veux éviter que deux appels Http soient réalisés au lieu d'un à la discovery Url dans le cadre d'oidc client
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/308
   */
  @Get(OidcClientRoutes.OIDC_CALLBACK)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getOidcCallback(
    @Req() req,
    @Res() res,
    @Param() params: GetOidcCallback,
    /**
     * @todo Adaptation for now, correspond to the oidc-provider side.
     * Named "OidcClient" because we need a future shared session between our libs oidc-provider and oidc-client
     * without a direct dependance like now.
     * @author Hugues
     * @date 2021-04-16
     * @ticket FC-xxx
     */
    @Session('OidcClient')
    sessionOidc: ISessionService<OidcClientSession>,
  ) {
    const { providerUid } = params;
    const { interactionId, idpId, idpState, idpNonce, spId } =
      await sessionOidc.get();

    await this.oidcClient.utils.checkIdpBlacklisted(spId, providerUid);

    const tokenParams = {
      providerUid,
      idpState,
      idpNonce,
    };

    const { accessToken, acr, amr } =
      await this.oidcClient.getTokenFromProvider(tokenParams, req);

    const userInfoParams = {
      accessToken,
      providerUid,
    };

    const identity = await this.oidcClient.getUserInfosFromProvider(
      userInfoParams,
      req,
    );

    await this.validateIdentity(idpId, providerUid, identity);

    const identityExchange: OidcSession = {
      idpIdentity: identity,
      idpAcr: acr,
      amr,
      idpAccessToken: accessToken,
    };
    sessionOidc.set({ ...identityExchange });

    // BUSINESS: Redirect to business page
    const { urlPrefix } = this.config.get<AppConfig>('App');
    const url = `${urlPrefix}/interaction/${interactionId}/verify`;

    this.logger.trace({
      route: OidcClientRoutes.OIDC_CALLBACK,
      method: 'GET',
      name: 'OidcClientRoutes.OIDC_CALLBACK',
      redirect: url,
    });

    res.redirect(url);
  }

  private async validateIdentity(
    idpId: string,
    providerUid: string,
    identity: Partial<OidcIdentityDto>,
  ) {
    const identityCheckHandler = await this.core.getFeature<ValidationError[]>(
      idpId,
      ProcessCore.ID_CHECK,
    );

    const errors = await identityCheckHandler.handle(identity);
    if (errors.length) {
      this.logger.trace({ errors }, LoggerLevelNames.WARN);
      throw new CoreFcpInvalidIdentityException();
    }
  }
}
