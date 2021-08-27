import {
  Body,
  Controller,
  Get,
  Next,
  Post,
  Query,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { CoreRoutes } from '@fc/core';
import { LoggerService } from '@fc/logger';
import { OidcProviderService } from '@fc/oidc-provider';
import { OidcProviderRoutes } from '@fc/oidc-provider/enums';

import { AuthorizeParamsDto, ErrorParamsDto } from '../dto';
import { CoreFcpFailedAbortSessionException } from '../exceptions';

@Controller()
export class OidcProviderController {
  constructor(
    private readonly logger: LoggerService,
    private readonly oidcProvider: OidcProviderService,
  ) {
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
  getAuthorize(@Next() next, @Query() query: AuthorizeParamsDto) {
    this.logger.trace({
      route: OidcProviderRoutes.AUTHORIZATION,
      method: 'GET',
      name: 'OidcProviderRoutes.AUTHORIZATION',
      query,
    });
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

  // A controller is an exception to the max-params lint due to decorators
  @Get(CoreRoutes.REDIRECT_TO_SP_WITH_ERROR)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async redirectToSpWithError(
    @Query() { error, error_description: errorDescription }: ErrorParamsDto,
    @Req() req,
    @Res() res,
  ) {
    try {
      await this.oidcProvider.abortInteraction(
        req,
        res,
        error,
        errorDescription,
      );
    } catch (error) {
      throw new CoreFcpFailedAbortSessionException(error);
    }
  }
}
