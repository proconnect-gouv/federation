import {
  Controller,
  Get,
  Next,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
  Body,
  Req,
  Res,
} from '@nestjs/common';
import { AuthorizeParamsDTO, RevocationTokenParamsDTO } from './dto';
import { OidcProviderRoutes } from './enums';
import { OidcProviderService } from './oidc-provider.service';

@Controller()
export class OidcProviderController {
  constructor(private readonly oidcProvider: OidcProviderService) {}

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
  getAuthorize(@Next() next, @Query() _query: AuthorizeParamsDTO) {
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
  postAuthorize(@Next() next, @Body() _body: AuthorizeParamsDTO) {
    // Pass the query to oidc-provider
    return next();
  }

  @Post(OidcProviderRoutes.REDIRECT_TO_SP)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getLogin(@Req() req, @Res() res) {
    return this.oidcProvider.finishInteraction(req, res);
  }

  @Post(OidcProviderRoutes.TOKEN)
  postToken(@Next() next) {
    // Pass the query to oidc-provider
    return next();
  }

  @Post(OidcProviderRoutes.REVOCATION)
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
