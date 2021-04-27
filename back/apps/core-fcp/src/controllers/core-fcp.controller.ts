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
  Next,
} from '@nestjs/common';
import { OidcSession } from '@fc/oidc';
import { OidcProviderService } from '@fc/oidc-provider';
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
import { ScopesService } from '@fc/scopes';
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
import { Core, OidcIdentityDto } from '../dto';
import { CoreFcpService } from '../services';
import { ProcessCore } from '../enums';
import { CoreFcpInvalidIdentityException } from '../exceptions';

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
    private readonly scopes: ScopesService,
    private readonly notifications: NotificationsService,
    private readonly oidcClient: OidcClientService,
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
  @Render('interaction')
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
    const { client_id: clientId } = params;

    const {
      idpFilterExclude,
      idpFilterList,
    } = await this.serviceProvider.getById(clientId);
    const providers = await this.identityProvider.getFilteredList(
      idpFilterList,
      idpFilterExclude,
    );
    const notifications = await this.notifications.getNotifications();
    return {
      uid,
      params,
      scope,
      providers,
      notifications,
      spName,
    };
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

    const {
      type: spType,
      identityConsent: spIdentityConsent,
    } = await this.serviceProvider.getById(spId);
    const consentRequired = this.serviceProvider.consentRequired(
      spType,
      spIdentityConsent,
    );

    const {
      params: { scope },
    } = await this.oidcProvider.getInteraction(req, res);
    const scopes = scope.split(' ');

    const csrfToken = await this.generateAndStoreCsrf(sessionOidc);

    const claimsReadable = await this.scopes.mapScopesToLabel(scopes);

    return {
      interactionId,
      identity,
      spName,
      scopes,
      claims: claimsReadable,
      csrfToken,
      consentRequired,
    };
  }

  @Post(CoreRoutes.INTERACTION_LOGIN)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getLogin(
    @Next() next,
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

    const { spIdentity, csrfToken } = session;

    if (csrf !== csrfToken) {
      throw new CoreInvalidCsrfException();
    }

    if (!spIdentity) {
      throw new CoreMissingIdentityException();
    }

    // send the notification mail to the final user
    this.logger.debug('Sending authentication email to the end-user');
    await this.core.sendAuthenticationMail(session);

    // Pass the query to `@fc/oidc-provider` controller
    return next();
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
