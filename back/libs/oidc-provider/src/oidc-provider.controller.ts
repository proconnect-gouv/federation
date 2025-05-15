import {
  Body,
  Controller,
  Get,
  Header,
  Next,
  Post,
  Query,
  Req,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { ApiContentType } from '@fc/app';
import { LoggerService } from '@fc/logger';

import { LogoutParamsDto, RevocationTokenParamsDTO } from './dto';
import { OidcProviderRoutes } from './enums';
import { OidcProviderRenderedJsonExceptionFilter } from './filters';

@Controller()
export class OidcProviderController {
  constructor(private readonly logger: LoggerService) {}

  @Post(OidcProviderRoutes.TOKEN)
  @Header('Content-Type', ApiContentType.JSON)
  @UseFilters(OidcProviderRenderedJsonExceptionFilter)
  postToken(@Next() next, @Req() req) {
    const { body, query, headers } = req;

    this.logger.debug({
      body,
      query,
      headers,
    });

    // Pass the query to oidc-provider
    return next();
  }

  @Post(OidcProviderRoutes.REVOCATION)
  @Header('Content-Type', ApiContentType.JSON)
  @UseFilters(OidcProviderRenderedJsonExceptionFilter)
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  revokeToken(@Next() next, @Body() _body: RevocationTokenParamsDTO) {
    // Pass the query to oidc-provider
    return next();
  }

  @Get(OidcProviderRoutes.USERINFO)
  @Header('Content-Type', ApiContentType.JWT)
  @UseFilters(OidcProviderRenderedJsonExceptionFilter)
  getUserInfo(@Next() next, @Req() req) {
    const { body, query, headers } = req;

    this.logger.debug({
      body,
      query,
      headers,
    });
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
