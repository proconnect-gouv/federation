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
import { LoggerService } from '@fc/logger';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import {
  ISessionGenericService,
  Session,
  SessionGenericNotFoundException,
} from '@fc/session-generic';
import { OidcClientSession } from '@fc/oidc-client';
import { ConfigService } from '@fc/config';
import { AppConfig } from '@fc/app';
import { CryptographyService } from '@fc/cryptography';
import { NotificationsService } from '@fc/notifications';
import { ServiceProviderAdapterMongoService } from '@fc/service-provider-adapter-mongo';
import {
  GetOidcCallback,
  OidcClientConfig,
  OidcClientRoutes,
  OidcClientService,
} from '@fc/oidc-client';
import {
  Interaction,
  CsrfToken,
  CoreRoutes,
  CoreMissingIdentityException,
  CoreInvalidCsrfException,
} from '@fc/core';
import { TrackingService } from '@fc/tracking';
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
  ) {
    this.logger.setContext(this.constructor.name);
  }

  @Get(CoreRoutes.DEFAULT)
  getDefault(@Res() res) {
    const { defaultRedirectUri } = this.config.get<Core>('Core');
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
    sessionOidc: ISessionGenericService<OidcClientSession>,
  ) {
    const session = await sessionOidc.get();
    if (!session) {
      throw new SessionGenericNotFoundException('OidcClient');
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
      return;
    }

    const {
      idpFilterExclude,
      idpFilterList,
    } = await this.serviceProvider.getById(clientId);
    const providers = await this.identityProvider.getFilteredList(
      idpFilterList,
      idpFilterExclude,
    );
    const notifications = await this.notifications.getNotifications();
    return res.render('interaction', {
      uid,
      params,
      scope,
      providers,
      notifications,
      spName,
    });
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
    sessionOidc: ISessionGenericService<OidcClientSession>,
  ) {
    const { interactionId } = await sessionOidc.get();
    await this.core.verify(sessionOidc, req);

    const { urlPrefix } = this.config.get<AppConfig>('App');
    res.redirect(`${urlPrefix}/interaction/${interactionId}/consent`);
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
    sessionOidc: ISessionGenericService<OidcClientSession>,
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
    const csrfToken = await this.generateAndStoreCsrf(sessionOidc);

    return {
      interactionId,
      identity,
      spName,
      scopes,
      claims,
      csrfToken,
      consentRequired,
    };
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
    sessionOidc: ISessionGenericService<OidcClientSession>,
  ) {
    const { _csrf: csrf } = body;
    const session: OidcSession = await sessionOidc.get();

    if (!session) {
      throw new SessionGenericNotFoundException('OidcClient');
    }

    const { spId, spIdentity, csrfToken } = session;

    if (csrf !== csrfToken) {
      throw new CoreInvalidCsrfException();
    }

    if (!spIdentity) {
      throw new CoreMissingIdentityException();
    }

    this.logger.trace({ csrf, spIdentity, csrfToken });

    const interaction = await this.oidcProvider.getInteraction(req, res);
    const trackingContext = req;
    this.trackDatatransfer(trackingContext, interaction, spId);

    // send the notification mail to the final user
    await this.core.sendAuthenticationMail(session);

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
    sessionOidc: ISessionGenericService<OidcClientSession>,
  ) {
    const { providerUid } = params;
    const {
      interactionId,
      idpId,
      idpState,
      idpNonce,
      spId,
    } = await sessionOidc.get();

    await this.oidcClient.utils.checkIdpBlacklisted(spId, providerUid);

    const tokenParams = {
      providerUid,
      idpState,
      idpNonce,
    };

    const {
      accessToken,
      acr,
      amr,
    } = await this.oidcClient.getTokenFromProvider(tokenParams, req);

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
    res.redirect(`${urlPrefix}/interaction/${interactionId}/verify`);
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
      throw new CoreFcpInvalidIdentityException(providerUid, errors);
    }
  }

  /**
   * @TODO #203
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/203
   */
  private async generateAndStoreCsrf(
    sessionOidc: ISessionGenericService<OidcClientSession>,
  ): Promise<string> {
    const csrfTokenLength = 32;
    const csrfToken: string = this.crypto.genRandomString(csrfTokenLength);
    await sessionOidc.set({ csrfToken: csrfToken });
    return csrfToken;
  }
}
