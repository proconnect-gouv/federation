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
import { SessionService } from '@fc/session';
import { OidcProviderService } from '@fc/oidc-provider';
import { IOidcIdentity } from '@fc/oidc';
import { MockIdentityProviderFcaRoutes } from '../enums';
import { MockIdentityProviderFcaService } from '../services';
import { Identity, SignInDTO } from '../dto';

@Controller()
export class MockIdentityProviderFcaController {
  constructor(
    private readonly logger: LoggerService,
    private readonly session: SessionService,
    private readonly oidcProvider: OidcProviderService,
    private readonly mockIdentityProviderFcaService: MockIdentityProviderFcaService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  @Get(MockIdentityProviderFcaRoutes.INDEX)
  async index() {
    return { status: 'ok' };
  }

  @Get(MockIdentityProviderFcaRoutes.INTERACTION)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Render('interaction')
  async getInteraction(@Req() req, @Res() res) {
    const { uid, params } = await this.oidcProvider.getInteraction(req, res);

    const { interactionId } = req.fc;
    const { spName } = await this.session.get(interactionId);

    return {
      uid,
      params,
      spName,
    };
  }

  /**
   * @todo validate body (user uid)
   */
  @Post(MockIdentityProviderFcaRoutes.INTERACTION_LOGIN)
  async getLogin(@Next() next, @Body() body: SignInDTO): Promise<void> {
    const { login, interactionId } = body;
    const identity: Identity = await this.mockIdentityProviderFcaService.getIdentity(
      login,
    );

    const spIdentity: IOidcIdentity = {
      ...identity,
      sub: identity.uid,
    };

    // Save in session
    this.session.patch(interactionId, {
      spIdentity,
    });

    return next();
  }
}
