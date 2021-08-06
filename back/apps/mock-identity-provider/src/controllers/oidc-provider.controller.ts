import {
  Body,
  Controller,
  Get,
  Next,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { LoggerService } from '@fc/logger';
import { OidcProviderRoutes } from '@fc/oidc-provider/enums';
import { ISessionService, Session } from '@fc/session';

import { AppSession, AuthorizeParamsDto } from '../dto';

@Controller()
export class OidcProviderController {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(this.constructor.name);
  }

  /**
   * Authorize route via HTTP GET
   * Authorization endpoint MUST support GET method
   * @see https://openid.net/specs/openid-connect-core-1_0.html#AuthorizationEndpoint
   *
   * @TODO #144 do a more shallow validation and let oidc-provider handle redirections
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/144
   */
  @Get(OidcProviderRoutes.AUTHORIZATION)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async getAuthorize(
    @Next() next,
    @Query() query: AuthorizeParamsDto,
    @Session('App') appSession: ISessionService<AppSession>,
  ) {
    this.logger.trace({
      route: OidcProviderRoutes.AUTHORIZATION,
      method: 'GET',
      name: 'OidcProviderRoutes.AUTHORIZATION',
      query,
    });

    await appSession.set('finalSpId', query.sp_id);

    // Pass the query to oidc-provider
    return next();
  }

  /**
   * Authorize route via HTTP POST
   * Authorization endpoint MUST support POST method
   * @see https://openid.net/specs/openid-connect-core-1_0.html#AuthorizationEndpoint
   *
   * @TODO #144 do a more shallow validation and let oidc-provider handle redirections
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/144
   */
  @Post(OidcProviderRoutes.AUTHORIZATION)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  postAuthorize(@Next() next, @Body() body: AuthorizeParamsDto) {
    this.logger.trace({
      route: OidcProviderRoutes.AUTHORIZATION,
      method: 'POST',
      name: 'OidcProviderRoutes.AUTHORIZATION',
      body,
    });
    // Pass the query to oidc-provider
    return next();
  }
}
