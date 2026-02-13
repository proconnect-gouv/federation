import { randomBytes } from 'crypto';

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { isEmpty } from 'lodash';

import {
  Body,
  Controller,
  Get,
  Header,
  Post,
  Query,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { ConfigService } from '@fc/config';
import { LoggerService } from '@fc/logger';
import { TrackedEvent } from '@fc/logger/enums';
import { OidcClientService } from '@fc/oidc-client';
import { OidcProviderRoutes } from '@fc/oidc-provider/enums';
import { OidcProviderService } from '@fc/oidc-provider/oidc-provider.service';
import { type ISessionService } from '@fc/session';

import { UserSessionDecorator } from '../decorators';
import {
  ActiveUserSessionDto,
  AppConfig,
  AuthorizeParamsDto,
  LogoutParamsDto,
  RevocationTokenParamsDTO,
  UserSession,
} from '../dto';

@Controller()
export class OidcProviderController {
  private prefix: string;
  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly oidcClient: OidcClientService,
    private readonly oidcProviderService: OidcProviderService,
  ) {
    this.prefix = this.config.get<AppConfig>('App').urlPrefix;
  }

  @Get(OidcProviderRoutes.AUTHORIZATION)
  @Header('cache-control', 'no-store')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  )
  getAuthorize(@Req() req, @Res() res, @Query() _query: AuthorizeParamsDto) {
    req.url = req.originalUrl.replace(this.prefix, '');
    return this.oidcProviderService.getCallback()(req, res);
  }

  @Post(OidcProviderRoutes.AUTHORIZATION)
  @Header('cache-control', 'no-store')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      disableErrorMessages: false,
      validationError: { target: true },
    }),
  )
  postAuthorize(@Req() req, @Res() res, @Body() _body: AuthorizeParamsDto) {
    req.url = req.originalUrl.replace(this.prefix, '');
    return this.oidcProviderService.getCallback()(req, res);
  }

  @Get(OidcProviderRoutes.AUTHORIZATION_RESUME)
  getAuthorizeResume(@Req() req, @Res() res) {
    req.url = req.originalUrl.replace(this.prefix, '');
    return this.oidcProviderService.getCallback()(req, res);
  }

  @Post(OidcProviderRoutes.TOKEN)
  @Header('Content-Type', 'application/json')
  postToken(@Req() req, @Res() res) {
    req.url = req.originalUrl.replace(this.prefix, '');
    return this.oidcProviderService.getCallback()(req, res);
  }

  @Post(OidcProviderRoutes.REVOCATION)
  @Header('Content-Type', 'application/json')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
    }),
  )
  revokeToken(@Req() req, @Res() res, @Body() _body: RevocationTokenParamsDTO) {
    req.url = req.originalUrl.replace(this.prefix, '');
    return this.oidcProviderService.getCallback()(req, res);
  }

  @Get(OidcProviderRoutes.USERINFO)
  @Header('Content-Type', 'application/jwt')
  getUserInfo(@Req() req, @Res() res) {
    req.url = req.originalUrl.replace(this.prefix, '');
    return this.oidcProviderService.getCallback()(req, res);
  }

  @Post(OidcProviderRoutes.USERINFO)
  postUserInfo(@Req() req, @Res() res) {
    req.url = req.originalUrl.replace(this.prefix, '');
    return this.oidcProviderService.getCallback()(req, res);
  }

  @Get(OidcProviderRoutes.END_SESSION)
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
    }),
  )
  async getEndSession(
    @Req() req,
    @Res() res,
    @Query() _query: LogoutParamsDto,
    @UserSessionDecorator() userSession: ISessionService<UserSession>,
  ) {
    if (req.query.from_idp !== 'true') {
      this.logger.track(TrackedEvent.SP_REQUESTED_LOGOUT);
    }

    const activeUserSession = plainToInstance(
      ActiveUserSessionDto,
      userSession.get(),
    );
    const activeUserSessionValidationErrors = await validate(activeUserSession);
    const isUserConnected = isEmpty(activeUserSessionValidationErrors);

    if (isUserConnected) {
      const { idpIdToken, idpId } = activeUserSession;
      userSession.clear();

      if (await this.oidcClient.hasEndSessionUrl(idpId)) {
        this.logger.track(TrackedEvent.FC_REQUESTED_LOGOUT_FROM_IDP);

        userSession.set({
          orginalLogoutUrlSearchParamsFromSp: new URLSearchParams(
            req.query,
          ).toString(),
        });

        const endSessionUrl = await this.oidcClient.getEndSessionUrl(
          idpId,
          // note that state is never tested and could be removed in a dedicated PR
          randomBytes(24).toString('base64url'),
          idpIdToken,
        );

        return res.redirect(endSessionUrl);
      }
    }

    this.logger.track(TrackedEvent.FC_SESSION_TERMINATED);
    await userSession.destroy();

    // let `oidc-provider` close his own session
    req.url = req.originalUrl.replace(this.prefix, '');
    return this.oidcProviderService.getCallback()(req, res);
  }

  @Post(OidcProviderRoutes.END_SESSION_CONFIRM)
  postEndSessionConfirm(@Req() req, @Res() res) {
    req.url = req.originalUrl.replace(this.prefix, '');
    return this.oidcProviderService.getCallback()(req, res);
  }

  @Get(OidcProviderRoutes.END_SESSION_SUCCESS)
  getEndSessionSuccess(@Req() req, @Res() res) {
    req.url = req.originalUrl.replace(this.prefix, '');
    return this.oidcProviderService.getCallback()(req, res);
  }

  @Get(OidcProviderRoutes.JWKS)
  @Header('Content-Type', 'application/jwk-set+json')
  @Header('cache-control', 'public, max-age=600')
  getJwks(@Req() req, @Res() res) {
    req.url = req.originalUrl.replace(this.prefix, '');
    return this.oidcProviderService.getCallback()(req, res);
  }

  @Get(OidcProviderRoutes.OPENID_CONFIGURATION)
  @Header('cache-control', 'public, max-age=600')
  getOpenidConfiguration(@Req() req, @Res() res) {
    req.url = req.originalUrl.replace(this.prefix, '');
    return this.oidcProviderService.getCallback()(req, res);
  }

  @Post(OidcProviderRoutes.INTROSPECTION)
  postTokenIntrospection(@Req() req, @Res() res) {
    req.url = req.originalUrl.replace(this.prefix, '');
    return this.oidcProviderService.getCallback()(req, res);
  }
}
