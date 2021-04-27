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
import { OidcClientSession } from '@fc/oidc-client';
import { ISessionGenericService, Session } from '@fc/session-generic';
import { RevocationTokenParamsDTO } from './dto';
import { OidcProviderRoutes } from './enums';
import { OidcProviderService } from './oidc-provider.service';

@Controller()
export class OidcProviderController {
  constructor(private readonly oidcProvider: OidcProviderService) {}

  @Post(OidcProviderRoutes.REDIRECT_TO_SP)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getLogin(
    @Req() req,
    @Res() res,
    /**
     * @todo Adaptation for now, correspond to the oidc-provider side.
     * Named "OidcClient" because we need a future shared session between our libs oidc-provider and oidc-client
     * without a direct dependance like now.
     * @author Hugues
     * @date 2021-04-16
     * @ticket FC-xxx
     */
    @Session('OidcClient')
    sessionOidc: ISessionGenericService<OidcClientSession>,
  ): Promise<void> {
    const session: OidcClientSession = await sessionOidc.get();
    return this.oidcProvider.finishInteraction(req, res, session);
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
