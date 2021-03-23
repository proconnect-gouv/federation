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
import { LoggerService } from '@fc/logger';
import { IdentityProviderService } from '@fc/identity-provider';
import { ServiceProviderService } from '@fc/service-provider';
import { SessionService } from '@fc/session';
import { ConfigService } from '@fc/config';
import { MinistriesService } from '@fc/ministries';
import { AppConfig } from '@fc/app';
import {
  Interaction,
  CoreRoutes,
  CoreMissingIdentityException,
} from '@fc/core';
import {
  GetOidcCallback,
  OidcClientConfig,
  OidcClientRoutes,
  OidcClientService,
} from '@fc/oidc-client';
import { Core } from '../dto';
import { CoreFcaService } from '../services';

@Controller()
export class CoreFcaController {
  // Dependency injection can require more than 4 parameters
  /* eslint-disable-next-line max-params */
  constructor(
    private readonly logger: LoggerService,
    private readonly oidcProvider: OidcProviderService,
    private readonly identityProvider: IdentityProviderService,
    private readonly serviceProvider: ServiceProviderService,
    private readonly ministries: MinistriesService,
    private readonly core: CoreFcaService,
    private readonly session: SessionService,
    private readonly config: ConfigService,
    private readonly oidcClient: OidcClientService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  @Get(CoreRoutes.DEFAULT)
  getDefault(@Res() res) {
    const { defaultRedirectUri } = this.config.get<Core>('Core');
    res.redirect(301, defaultRedirectUri);
  }

  @Get(CoreRoutes.FCA_FRONT_DATAS)
  async getFrontData(@Req() req, @Res() res) {
    const { params } = await this.oidcProvider.getInteraction(req, res);
    const { scope } = this.config.get<OidcClientConfig>('OidcClient');
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
    };

    const ministries = await this.ministries.getList();
    const {
      idpFilterExclude,
      idpFilterList,
    } = await this.serviceProvider.getById(client_id);

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

    const { interactionId } = req.fc;

    const { spName } = await this.session.get(interactionId);

    return res.json({
      redirectToIdentityProviderInputs,
      redirectURL: '/api/v2/redirect-to-idp',
      ministries,
      identityProviders,
      serviceProviderName: spName,
    });
  }

  @Get(CoreRoutes.INTERACTION)
  @Render('interaction')
  async getInteraction() {
    return {};
  }

  @Get(CoreRoutes.INTERACTION_VERIFY)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getVerify(@Req() req, @Res() res, @Param() _params: Interaction) {
    await this.core.verify(req);

    const { urlPrefix } = this.config.get<AppConfig>('App');
    res.redirect(`${urlPrefix}/login`);
  }

  /**
   * @TODO #185 Remove this controller once it is globaly available in `@fc/oidc-provider`
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/merge_requests/185
   */
  @Get(CoreRoutes.INTERACTION_LOGIN)
  async getLogin(@Req() req, @Res() res) {
    const { interactionId } = req.fc;
    const { spIdentity } = await this.session.get(interactionId);
    if (!spIdentity) {
      throw new CoreMissingIdentityException();
    }

    return this.oidcProvider.finishInteraction(req, res);
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
  ) {
    const { providerUid } = params;
    const uid = req.fc.interactionId;
    const { idpState, idpNonce, spId } = await this.session.get(uid);

    await this.oidcClient.utils.checkIdpBlacklisted(spId, providerUid);

    /**
     *  @todo
     *    author: Arnaud & Hugues
     *    date: 23/03/2020
     *    ticket: FC-244 (identity, DTO, Factorisation)
     *
     *    problem: reduce the complexity of the oidc-callback functions
     *    action: take token and userinfo and add them together in oidc
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

    const identityExchange = {
      idpIdentity: identity,
      idpAcr: acr,
      idpAccessToken: accessToken,
    };
    this.session.patch(uid, identityExchange);
    // BUSINESS: Redirect to business page
    const { urlPrefix } = this.config.get<AppConfig>('App');
    res.redirect(`${urlPrefix}/interaction/${uid}/verify`);
  }
}
