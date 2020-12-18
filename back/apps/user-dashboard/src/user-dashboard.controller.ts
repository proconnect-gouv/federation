import {
  Controller,
  Get,
  Res,
  Render,
  Query,
  Body,
  Post,
  ValidationPipe,
  UsePipes,
  Req,
} from '@nestjs/common';
import { OidcClientService } from '@fc/oidc-client';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';
import { CryptographyService } from '@fc/cryptography';
import { UserDashboardRoutes } from './enums';
import {
  UserDashboardTokenRevocationException,
  UserDashboardUserinfoException,
} from './exceptions';
import { AccessTokenParamsDTO } from './dto';

@Controller()
export class UserDashboardController {
  constructor(
    private readonly oidcClient: OidcClientService,
    private readonly logger: LoggerService,
    private readonly session: SessionService,
    private readonly crypto: CryptographyService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  @Get()
  @Render('index')
  async index(@Res() res) {
    /**
     * @TODO #179
     * This is just a mock, so we don't bother making this configurable...
     * We'll soon update session system to handle all this init stuff automatically anyway.
     * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/179
     */
    const sessionIdLength = 32;
    const sessionId = encodeURIComponent(
      this.crypto.genRandomString(sessionIdLength),
    );
    await this.session.init(res, sessionId, { idpState: sessionId });

    return {
      titleFront: 'Mock Service Provider',
      state: sessionId,
    };
  }

  @Get(UserDashboardRoutes.LOGOUT)
  async logout(@Res() res) {
    res.redirect(UserDashboardRoutes.LOGOUT_CALLBACK);
  }

  @Get(UserDashboardRoutes.LOGOUT_CALLBACK)
  async logoutCallback(@Res() res) {
    /**
     * @TODO #192 ETQ Dev, je complète la session pendant la cinématique des mocks
     * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/192
     * */
    return res.redirect('/');
  }

  @Post(UserDashboardRoutes.REVOCATION)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Render('success-revoke-token')
  async revocationToken(@Res() res, @Body() body: AccessTokenParamsDTO) {
    try {
      /**
       * @TODO #251 ETQ Dev, j'utilise une configuration pour savoir si j'utilise FC, AC, EIDAS, et avoir les valeurs de scope et acr en config et non en dur.
       * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/251
       */
      const providerUid = 'corev2';
      const { accessToken } = body;
      await this.oidcClient.revokeToken(accessToken, providerUid);

      return {
        titleFront: 'Mock Service Provider - Token révoqué',
        accessToken,
      };
    } catch (e) {
      /**
       * @params e.error : error return by panva lib
       * @params e.error_description : error description return by panva lib
       *
       * If exception is not return by panva, we throw our custom class exception
       * when we try to revoke the token : 'MockServiceProviderTokenRevocationException'
       */
      if (e.error && e.error_description) {
        return res.redirect(
          `/error?error=${e.error}&error_description=${e.error_description}`,
        );
      }
      throw new UserDashboardTokenRevocationException(e);
    }
  }

  @Post(UserDashboardRoutes.USERINFO)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Render('login-callback')
  async retrieveUserinfo(@Res() res, @Body() body: AccessTokenParamsDTO) {
    try {
      /**
       * @TODO #251 ETQ Dev, j'utilise une configuration pour savoir si j'utilise FC, AC, EIDAS, et avoir les valeurs de scope et acr en config et non en dur.
       * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/251
       */
      const providerUid = 'corev2';
      const { accessToken } = body;
      // OIDC: call idp's /userinfo endpoint
      const idpIdentity = await this.oidcClient.getUserInfo(
        accessToken,
        providerUid,
      );

      return {
        titleFront: 'Mock Service Provider - Userinfo',
        accessToken,
        idpIdentity,
      };
    } catch (e) {
      /**
       * @params e.error : error return by panva lib
       * @params e.error_description : error description return by panva lib
       *
       * If exception is not return by panva, we throw our custom class exception
       * when we try to receive userinfo : 'MockServiceProviderUserinfoException'
       */
      if (e.error && e.error_description) {
        return res.redirect(
          `/error?error=${e.error}&error_description=${e.error_description}`,
        );
      }
      throw new UserDashboardUserinfoException(e);
    }
  }

  @Get(UserDashboardRoutes.VERIFY)
  @Render('login-callback')
  async getVerify(@Req() req) {
    const uid = req.fc.interactionId;
    const { idpIdentity } = await this.session.get(uid);

    return { idpIdentity };
  }

  @Get(UserDashboardRoutes.ERROR)
  @Render('error')
  async error(@Query() query) {
    return {
      titleFront: "Mock service provider - Erreur lors de l'authentification",
      ...query,
    };
  }
}
