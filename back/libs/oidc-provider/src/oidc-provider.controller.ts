import {
  Body,
  Controller,
  Get,
  Header,
  Next,
  Post,
  Query,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { ApiContentType } from '@fc/app';
import { SetStep } from '@fc/flow-steps';
import { LoggerService } from '@fc/logger';

import {
  AuthorizeParamsDto,
  LogoutParamsDto,
  RevocationTokenParamsDTO,
} from './dto';
import { OidcProviderRoutes } from './enums';
import { OidcProviderRenderedJsonExceptionFilter } from './filters';

@Controller()
export class OidcProviderController {
  constructor(private readonly logger: LoggerService) {}

  @Get(OidcProviderRoutes.AUTHORIZATION)
  @Header('cache-control', 'no-store')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
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
      forbidNonWhitelisted: true,
    }),
  )
  @SetStep()
  postAuthorize(@Next() next, @Body() _body: AuthorizeParamsDto) {
    // Pass the query to oidc-provider
    return next();
  }

  @Post(OidcProviderRoutes.TOKEN)
  @Header('Content-Type', ApiContentType.JSON)
  @UseFilters(OidcProviderRenderedJsonExceptionFilter)
  postToken(@Next() next) {
    // Pass the query to oidc-provider
    return next();
  }

  @Post(OidcProviderRoutes.REVOCATION)
  @Header('Content-Type', ApiContentType.JSON)
  @UseFilters(OidcProviderRenderedJsonExceptionFilter)
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
  @Header('Content-Type', ApiContentType.JWT)
  @UseFilters(OidcProviderRenderedJsonExceptionFilter)
  getUserInfo(@Next() next) {
    // Pass the query to oidc-provider
    return next();
  }

  @Get(OidcProviderRoutes.END_SESSION)
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  getEndSession(@Next() next, @Query() _query: LogoutParamsDto) {
    // Pass the query to oidc-provider
    return next();
  }

  @Get(OidcProviderRoutes.JWKS)
  @Header('Content-Type', ApiContentType.JWKS)
  @Header('cache-control', 'public, max-age=600')
  @UseFilters(OidcProviderRenderedJsonExceptionFilter)
  getJwks(@Next() next) {
    // Pass the query to oidc-provider
    return next();
  }

  @Get(OidcProviderRoutes.OPENID_CONFIGURATION)
  @Header('cache-control', 'public, max-age=600')
  @UseFilters(OidcProviderRenderedJsonExceptionFilter)
  getOpenidConfiguration(@Next() next) {
    // Pass the query to oidc-provider
    return next();
  }
}
