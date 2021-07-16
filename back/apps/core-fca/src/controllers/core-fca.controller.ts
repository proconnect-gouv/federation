import { ValidatorOptions } from 'class-validator';
import { ClassTransformOptions } from 'class-transformer';
import {
  Controller,
  Get,
  Render,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
  Param,
} from '@nestjs/common';
import { OidcProviderService } from '@fc/oidc-provider';
import { LoggerLevelNames, LoggerService } from '@fc/logger';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { ServiceProviderAdapterMongoService } from '@fc/service-provider-adapter-mongo';
import {
  ISessionGenericService,
  Session,
  SessionGenericCsrfService,
  SessionGenericNotFoundException,
  SessionGenericService,
} from '@fc/session-generic';
import { ConfigService } from '@fc/config';
import { MinistriesService } from '@fc/ministries';
import { AppConfig } from '@fc/app';
import { validateDto } from '@fc/common';
import {
  Interaction,
  CoreRoutes,
  CoreMissingIdentityException,
} from '@fc/core';
import { OidcSession } from '@fc/oidc';
import {
  GetOidcCallback,
  OidcClientRoutes,
  OidcClientService,
  OidcClientConfig,
  OidcClientSession,
} from '@fc/oidc-client';
import { Core, OidcIdentityDto } from '../dto';
import { CoreFcaService } from '../services';
import { CoreFcaInvalidIdentityException } from '../exceptions';

@Controller()
export class CoreFcaController {
  // Dependency injection can require more than 4 parameters
  /* eslint-disable-next-line max-params */
  constructor(
    private readonly logger: LoggerService,
    private readonly oidcProvider: OidcProviderService,
    private readonly identityProvider: IdentityProviderAdapterMongoService,
    private readonly serviceProvider: ServiceProviderAdapterMongoService,
    private readonly ministries: MinistriesService,
    private readonly core: CoreFcaService,
    private readonly config: ConfigService,
    private readonly oidcClient: OidcClientService,
    private readonly sessionService: SessionGenericService,
    private readonly csrfService: SessionGenericCsrfService,
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

  @Get(CoreRoutes.FCA_FRONT_DATAS)
  async getFrontData(
    @Req() req,
    @Res() res,
    /**
     * @todo Adaptation for now, correspond to the oidc-provider side.
     * Named "OidcClient" because we need a future shared session between our libs oidc-provider and oidc-client
     * without a direct dependance like now
     */
    @Session('OidcClient')
    sessionOidc: ISessionGenericService<OidcClientSession>,
  ) {
    const session = await sessionOidc.get();
    if (!session) {
      return {};
    }
    const { spName } = session;
    const { params } = await this.oidcProvider.getInteraction(req, res);
    const { scope } = this.config.get<OidcClientConfig>('OidcClient');

    // -- generate and store in session the CSRF token
    const csrfToken = this.csrfService.get();
    await this.csrfService.save(sessionOidc, csrfToken);

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      redirect_uri,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      response_type,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      client_id,
    } = params;

    const redirectToIdentityProviderInputs = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      redirect_uri,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      response_type,
      scope,
      csrfToken,
    };

    const ministries = await this.ministries.getList();
    const { idpFilterExclude, idpFilterList } =
      await this.serviceProvider.getById(client_id);

    const identityProvidersList = await this.identityProvider.getFilteredList(
      idpFilterList,
      idpFilterExclude,
    );

    const identityProviders = identityProvidersList.map(
      ({ active, display, title, uid }) => ({
        active,
        display,
        name: title,
        uid,
      }),
    );

    const jsonResponse = {
      redirectToIdentityProviderInputs,
      redirectURL: '/api/v2/redirect-to-idp',
      ministries,
      identityProviders,
      serviceProviderName: spName,
    };

    this.logger.trace({
      route: CoreRoutes.FCA_FRONT_DATAS,
      method: 'GET',
      name: 'CoreRoutes.FCA_FRONT_DATAS',
      response: jsonResponse,
    });

    return res.json(jsonResponse);
  }

  @Get(CoreRoutes.INTERACTION)
  @Render('interaction')
  async getInteraction(
    @Session('OidcClient')
    sessionOidc: ISessionGenericService<OidcClientSession>,
  ) {
    const session = await sessionOidc.get();
    if (!session) {
      this.logger.trace(
        { route: CoreRoutes.INTERACTION },
        LoggerLevelNames.WARN,
      );
      throw new SessionGenericNotFoundException('OidcClient');
    }

    this.logger.trace({
      route: CoreRoutes.INTERACTION,
      method: 'GET',
      name: 'CoreRoutes.INTERACTION',
      session,
    });

    return {};
  }

  @Get(CoreRoutes.INTERACTION_VERIFY)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getVerify(
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
    await this.core.verify(sessionOidc);

    const { urlPrefix } = this.config.get<AppConfig>('App');
    const url = `${urlPrefix}/login`;

    this.logger.trace({
      route: CoreRoutes.INTERACTION_VERIFY,
      method: 'GET',
      name: 'CoreRoutes.INTERACTION_VERIFY',
      redirect: url,
    });

    res.redirect(url);
  }

  /**
   * @TODO #185 Remove this controller once it is globaly available in `@fc/oidc-provider`
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/merge_requests/185
   */
  @Get(CoreRoutes.INTERACTION_LOGIN)
  async getLogin(
    @Req() req,
    @Res() res,
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
    const { spIdentity } = await sessionOidc.get();
    if (!spIdentity) {
      this.logger.trace(
        { route: CoreRoutes.INTERACTION_LOGIN },
        LoggerLevelNames.WARN,
      );
      throw new CoreMissingIdentityException();
    }

    /**
     * We need to set an alias with the sub since later (findAccount) we do not have access
     * to the sessionId, nor the interactionId.
     */
    await this.sessionService.setAlias(spIdentity.sub, req.sessionId);

    this.logger.trace({
      route: CoreRoutes.INTERACTION_LOGIN,
      method: 'GET',
      name: 'CoreRoutes.INTERACTION_LOGIN',
      spIdentity,
    });

    const session: OidcClientSession = await sessionOidc.get();
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
    const { idpState, idpNonce, spId, interactionId } = await sessionOidc.get();

    await this.oidcClient.utils.checkIdpBlacklisted(spId, providerUid);

    /**
     *  @todo
     *  problem: reduce the complexity of the oidc-callback functions
     *  action: take token and userinfo and add them together in oidc.
     *
     *  @author Arnaud & Hugues
     *  @date 23/03/2020
     *  @ticket FC-244 (identity, DTO, Factorisation)
     */
    const tokenParams = {
      providerUid,
      idpState,
      idpNonce,
    };

    const { accessToken, acr } = await this.oidcClient.getTokenFromProvider(
      tokenParams,
      req,
    );

    const userInfoParams = {
      accessToken,
      providerUid,
    };

    const identity = await this.oidcClient.getUserInfosFromProvider(
      userInfoParams,
      req,
    );

    await this.validateIdentity(providerUid, identity);

    const identityExchange: OidcSession = {
      idpIdentity: identity,
      idpAcr: acr,
      idpAccessToken: accessToken,
    };
    await sessionOidc.set({ ...identityExchange });

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
    providerUid: string,
    identity: Partial<OidcIdentityDto>,
  ): Promise<boolean> {
    const validatorOptions: ValidatorOptions = {
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    };
    const transformOptions: ClassTransformOptions = {
      excludeExtraneousValues: true,
    };

    const errors = await validateDto(
      identity,
      OidcIdentityDto,
      validatorOptions,
      transformOptions,
    );

    if (errors.length) {
      this.logger.trace({ errors }, LoggerLevelNames.WARN);
      throw new CoreFcaInvalidIdentityException();
    }

    this.logger.trace({ validate: { providerUid, identity } });
    return true;
  }
}
