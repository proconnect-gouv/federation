import {
  Body,
  Controller,
  Get,
  Next,
  Post,
  Render,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { OidcClientSession } from '@fc/oidc-client';
import { OidcProviderService } from '@fc/oidc-provider';
import { ISessionService, Session } from '@fc/session';

import { AppSession, SignInDTO } from '../dto';
import { MockIdentityProviderRoutes } from '../enums';
import { MockIdentityProviderService } from '../services';

@Controller()
export class MockIdentityProviderController {
  constructor(
    private readonly oidcProvider: OidcProviderService,
    private readonly mockIdentityProviderService: MockIdentityProviderService,
  ) {}

  @Get(MockIdentityProviderRoutes.INDEX)
  index() {
    const response = { status: 'ok' };

    return response;
  }

  @Get(MockIdentityProviderRoutes.INTERACTION)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Render('interaction')
  async getInteraction(
    @Req()
    req,
    @Res()
    res,
    /**
     * @todo #1020 Partage d'une session entre oidc-provider & oidc-client
     * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/1020
     * @ticket FC-1020
     */
    @Session('OidcClient')
    sessionOidc: ISessionService<OidcClientSession>,
    @Session('App') appSession: ISessionService<AppSession>,
  ) {
    const { uid, params } = await this.oidcProvider.getInteraction(req, res);

    const spName = await sessionOidc.get('spName');
    const finalSpId = await appSession.get('finalSpId');

    const response = {
      uid,
      params,
      spName,
      finalSpId,
    };

    return response;
  }

  @Post(MockIdentityProviderRoutes.INTERACTION_LOGIN)
  async getLogin(
    @Next() next,
    @Body() body: SignInDTO,
    /**
     * @todo #1020 Partage d'une session entre oidc-provider & oidc-client
     * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/1020
     * @ticket FC-1020
     */
    @Session('OidcClient')
    sessionOidc: ISessionService<OidcClientSession>,
    @Session('App')
    sessionApp: ISessionService<AppSession>,
  ): Promise<void> {
    const { login, password, acr } = body;
    const spIdentity =
      await this.mockIdentityProviderService.getIdentity(login);

    if (!spIdentity) {
      throw new Error('Identity not found in database');
    }

    if (
      !this.mockIdentityProviderService.isPasswordValid(
        spIdentity.password,
        password,
      )
    ) {
      throw new Error('Password is invalid');
    }

    await sessionApp.set('userLogin', login);

    const spId = await sessionOidc.get('spId');
    const { sub, ...spIdentityCleaned } = spIdentity;
    const spAcr = acr;

    await sessionOidc.set({
      spAcr,
      spIdentity: spIdentityCleaned,
      amr: ['pwd'],
      subs: { [spId]: sub },
    });

    return next();
  }
}
