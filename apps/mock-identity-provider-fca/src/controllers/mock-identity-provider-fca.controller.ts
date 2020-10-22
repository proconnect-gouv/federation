import {
  Body,
  Controller,
  Get,
  Post,
  Render,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';
import { CryptographyService } from '@fc/cryptography';
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
    private readonly crypto: CryptographyService,
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
  async getLogin(@Req() req, @Res() res, @Body() body: SignInDTO): Promise<void> {
    const identity: Identity = await this.mockIdentityProviderFcaService.getIdentity(
      body.login,
    );

    const spIdentity: IOidcIdentity = {
      ...identity,
      sub: identity.uid,
    };

    // Save in session
    /**
     * @todo set the eIDAS level in a configuration file
     */
    const spAcr = 'eidas2';

    const sessionIdLength = 32;
    const sessionId = this.crypto.genRandomString(sessionIdLength);

    this.session.init(res, body.interactionId, {
      sessionId,
      spIdentity,
    });

    const result = {
      login: {
        account: body.interactionId,
        acr: spAcr,
        ts: Math.floor(Date.now() / 1000),
      },
      /**
       * We need to return this information, it will always be empty arrays
       * since franceConnect does not allow for partial authorizations yet,
       * it's an "all or nothing" consent.
       */
      consent: {
        rejectedScopes: [],
        rejectedClaims: [],
      },
    };

    return this.oidcProvider.finishInteraction(req, res, result);
  }
}
