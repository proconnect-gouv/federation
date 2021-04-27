import {
  Body,
  Controller,
  Get,
  Post,
  Render,
  Next,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { LoggerService } from '@fc/logger';
import { ISessionGenericService, Session } from '@fc/session-generic';
import { OidcClientSession } from '@fc/oidc-client';
import { OidcProviderService } from '@fc/oidc-provider';
import { IOidcIdentity } from '@fc/oidc';
import { MockIdentityProviderRoutes } from '../enums';
import { MockIdentityProviderService } from '../services';
import { SignInDTO } from '../dto';

@Controller()
export class MockIdentityProviderController {
  constructor(
    private readonly logger: LoggerService,
    private readonly oidcProvider: OidcProviderService,
    private readonly mockIdentityProviderService: MockIdentityProviderService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  @Get(MockIdentityProviderRoutes.INDEX)
  async index() {
    return { status: 'ok' };
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
     * @todo Adaptation for now, correspond to the oidc-provider side.
     * Named "OidcClient" because we need a future shared session between our libs oidc-provider and oidc-client
     * without a direct dependance like now.
     * @author Hugues
     * @date 2021-04-16
     * @ticket FC-xxx
     */
    @Session('OidcClient')
    sessionOidc: ISessionGenericService<OidcClientSession>,
  ) {
    const { uid, params } = await this.oidcProvider.getInteraction(req, res);

    const { spName } = await sessionOidc.get();

    return {
      uid,
      params,
      spName,
    };
  }

  @Post(MockIdentityProviderRoutes.INTERACTION_LOGIN)
  async getLogin(
    @Next() next,
    @Body() body: SignInDTO,
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
    const { login } = body;
    const spIdentity = (await this.mockIdentityProviderService.getIdentity(
      login,
    )) as IOidcIdentity;

    if (!spIdentity) {
      throw new Error('Identity not found in database');
    }

    sessionOidc.set({
      spIdentity,
    });

    return next();
  }
}
