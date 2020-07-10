import {
  Controller,
  Get,
  Next,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
  Inject,
  Body,
} from '@nestjs/common';
import { AuthorizeParamsDTO } from './dto';
import { OidcProviderRoutes } from './enums';
import { IServiceProviderService } from './interfaces';
import { SERVICE_PROVIDER_SERVICE } from './tokens';

@Controller()
export class OidcProviderController {
  constructor(
    @Inject(SERVICE_PROVIDER_SERVICE)
    private readonly serviceProvider: IServiceProviderService,
  ) {}

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
  getAuthorize(@Next() next, @Query() _params: AuthorizeParamsDTO) {
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
  postAuthorize(@Next() next, @Body() _params: AuthorizeParamsDTO) {
    // Pass the query to oidc-provider
    return next();
  }

  @Post(OidcProviderRoutes.TOKEN)
  postToken(@Next() next) {
    // Pass the query to oidc-provider
    return next();
  }

  @Get(OidcProviderRoutes.USERINFO)
  getUserInfo(@Next() next) {
    // Pass the query to oidc-provider
    return next();
  }

  @Get(OidcProviderRoutes.END_SESSION)
  getEndSession(@Next() next) {
    // Pass the query to oidc-provider
    return next();
  }
}
