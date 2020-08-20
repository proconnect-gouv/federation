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
} from '@nestjs/common';

import { OidcProviderService } from '@fc/oidc-provider';
import { LoggerService } from '@fc/logger';
import { IdentityProviderService } from '@fc/identity-provider';
import { SessionService } from '@fc/session';
import { ConfigService } from '@fc/config';
import { AppConfig } from '@fc/app';
import { CryptographyService } from '@fc/cryptography';
import { CoreFcpService } from '../services';
import { Interaction, CsrfToken, CoreFcp } from '../dto';
import { CoreFcpRoutes } from '../enums';
import {
  CoreFcpMissingIdentity,
  CoreFcpInvalidCsrfException,
} from '../exceptions';

@Controller()
export class CoreFcpController {
  constructor(
    private readonly logger: LoggerService,
    private readonly oidcProvider: OidcProviderService,
    private readonly identityProvider: IdentityProviderService,
    private readonly coreFcp: CoreFcpService,
    private readonly session: SessionService,
    private readonly config: ConfigService,
    private readonly crypto: CryptographyService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  @Get(CoreFcpRoutes.DEFAULT)
  getDefault(@Res() res) {
    const { defaultRedirectUri } = this.config.get<CoreFcp>('CoreFcp');
    res.redirect(301, defaultRedirectUri);
  }

  @Get(CoreFcpRoutes.INTERACTION)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Render('interaction')
  async getInteraction(@Req() req, @Res() res, @Param() _params: Interaction) {
    const { uid, params } = await this.oidcProvider.getInteraction(req, res);
    const providers = await this.identityProvider.getList();

    const { interactionId } = req.fc;
    const { spName } = await this.session.get(interactionId);

    return {
      uid,
      params,
      providers,
      spName,
    };
  }

  @Get(CoreFcpRoutes.INTERACTION_VERIFY)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getVerify(@Req() req, @Res() res, @Param() _params: Interaction) {
    const { interactionId } = req.fc;
    await this.coreFcp.verify(req);

    const urlPrefix = this.config.get<AppConfig>('App').urlPrefix;
    res.redirect(`${urlPrefix}/interaction/${interactionId}/consent`);
  }

  @Get(CoreFcpRoutes.INTERACTION_CONSENT)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Render('consent')
  async getConsent(@Req() req, @Res() res, @Param() _params: Interaction) {
    const { interactionId } = req.fc;
    const { spIdentity: identity, spName } = await this.session.get(
      interactionId,
    );

    /**
     * @TODO #193
     * ETQ dev, j'affiche les `claims` à la place des `scopes`
     * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/193
     */
    const {
      params: { scope },
    } = await this.oidcProvider.getInteraction(req, res);
    const scopes = scope.split(' ');

    const csrfToken = await this.generateAndStoreCsrf(req.fc.interactionId);

    return {
      interactionId,
      identity,
      spName,
      scopes,
      csrfToken,
    };
  }

  @Post(CoreFcpRoutes.INTERACTION_LOGIN)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getLogin(
    @Req() req,
    @Res() res,
    @Body() body: CsrfToken,
    @Param() _params: Interaction,
  ) {
    const { _csrf: csrf } = body;
    const { interactionId } = req.fc;
    const { spAcr, spIdentity, csrfToken } = await this.session.get(
      interactionId,
    );

    if (csrf !== csrfToken) {
      throw new CoreFcpInvalidCsrfException();
    }

    if (!spIdentity) {
      throw new CoreFcpMissingIdentity();
    }

    this.logger.debug('Sending authentication email to the end-user');
    // send the notification mail to the final user
    await this.coreFcp.sendAuthenticationMail(req);

    /**
     * Build Interaction results
     * For all available options, refer to `oidc-provider` documentation:
     * @see https://github.com/panva/node-oidc-provider/blob/master/docs/README.md#user-flows
     */
    const result = {
      login: {
        account: interactionId,
        acr: spAcr,
        ts: Math.floor(Date.now() / 1000),
      },
      /**
       * We need to return this information, it will always be empty arrays
       * since franceConnect does not allow for partial authorizations yet,
       * it's an "all or nothing" consent.
       */
      consent: {
        rejectedScopes: [],
        rejectedClaims: [],
      },
    };

    return this.oidcProvider.finishInteraction(req, res, result);
  }

  /**
   * @TODO #203
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/203
   */
  private async generateAndStoreCsrf(interactionId: string): Promise<string> {
    const csrfTokenLength = 32;
    const csrfToken = this.crypto.genRandomString(csrfTokenLength);
    await this.session.patch(interactionId, { csrfToken: csrfToken });
    return csrfToken;
  }
}
