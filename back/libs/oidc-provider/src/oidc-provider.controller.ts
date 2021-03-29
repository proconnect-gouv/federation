import {
  Controller,
  Get,
  Next,
  Post,
  UsePipes,
  ValidationPipe,
  Body,
  Req,
  Res,
} from '@nestjs/common';
import { RevocationTokenParamsDTO } from './dto';
import { OidcProviderRoutes } from './enums';
import { OidcProviderService } from './oidc-provider.service';

@Controller()
export class OidcProviderController {
  constructor(private readonly oidcProvider: OidcProviderService) {}

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
