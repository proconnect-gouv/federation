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
import { AppConfig } from '@fc/core';
import { SetStep } from '@fc/flow-steps';

import {
  AuthorizeParamsDto,
  LogoutParamsDto,
  RevocationTokenParamsDTO,
} from './dto';
import { OidcProviderRoutes } from './enums';
import { OidcProviderService } from './oidc-provider.service';

@Controller()
export class OidcProviderController {
  private prefix: string;
  constructor(
    private readonly config: ConfigService,
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
  @SetStep()
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
    }),
  )
  @SetStep()
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
  getEndSession(@Req() req, @Res() res, @Query() _query: LogoutParamsDto) {
    req.url = req.originalUrl.replace(this.prefix, '');
    return this.oidcProviderService.getCallback()(req, res);
  }

  @Post(OidcProviderRoutes.END_SESSION_CONFIRM)
  postEndSessionConfirm(@Req() req, @Res() res) {
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
