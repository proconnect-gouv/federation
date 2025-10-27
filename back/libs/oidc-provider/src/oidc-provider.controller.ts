import {
  Body,
  Controller,
  Get,
  Header,
  Next,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { SetStep } from '@fc/flow-steps';

import {
  AuthorizeParamsDto,
  LogoutParamsDto,
  RevocationTokenParamsDTO,
} from './dto';
import { OidcProviderRoutes } from './enums';

@Controller()
export class OidcProviderController {
  constructor() {}

  @Get(OidcProviderRoutes.AUTHORIZATION)
  @Header('cache-control', 'no-store')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  )
  @SetStep()
  getAuthorize(@Next() next, @Query() _query: AuthorizeParamsDto) {
    // Pass the query to oidc-provider
    return next();
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
  postAuthorize(@Next() next, @Body() _body: AuthorizeParamsDto) {
    // Pass the query to oidc-provider
    return next();
  }

  @Post(OidcProviderRoutes.TOKEN)
  @Header('Content-Type', 'application/json')
  postToken(@Next() next) {
    // Pass the query to oidc-provider
    return next();
  }

  @Post(OidcProviderRoutes.REVOCATION)
  @Header('Content-Type', 'application/json')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
    }),
  )
  revokeToken(@Next() next, @Body() _body: RevocationTokenParamsDTO) {
    // Pass the query to oidc-provider
    return next();
  }

  @Get(OidcProviderRoutes.USERINFO)
  @Header('Content-Type', 'application/jwt')
  getUserInfo(@Next() next) {
    // Pass the query to oidc-provider
    return next();
  }

  @Get(OidcProviderRoutes.END_SESSION)
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
    }),
  )
  getEndSession(@Next() next, @Query() _query: LogoutParamsDto) {
    // Pass the query to oidc-provider
    return next();
  }

  @Get(OidcProviderRoutes.JWKS)
  @Header('Content-Type', 'application/jwk-set+json')
  @Header('cache-control', 'public, max-age=600')
  getJwks(@Next() next) {
    // Pass the query to oidc-provider
    return next();
  }

  @Get(OidcProviderRoutes.OPENID_CONFIGURATION)
  @Header('cache-control', 'public, max-age=600')
  getOpenidConfiguration(@Next() next) {
    // Pass the query to oidc-provider
    return next();
  }
}
