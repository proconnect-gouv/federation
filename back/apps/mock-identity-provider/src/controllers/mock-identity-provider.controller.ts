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
import { MockIdentityProviderRoutes } from '../enums';
import { MockIdentityProviderService } from '../services';
import { SignInDTO } from '../dto';

@Controller()
export class MockIdentityProviderController {
  constructor(
    private readonly logger: LoggerService,
    private readonly session: SessionService,
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

  @Post(MockIdentityProviderRoutes.INTERACTION_LOGIN)
  async getLogin(@Next() next, @Body() body: SignInDTO): Promise<void> {
    const { login, interactionId } = body;
    const spIdentity = (await this.mockIdentityProviderService.getIdentity(
      login,
    )) as IOidcIdentity;

    if (!spIdentity) {
      throw new Error('Identity not found in database');
    }

    // Save in session
    this.session.patch(interactionId, {
      spIdentity,
    });

    return next();
  }
}
