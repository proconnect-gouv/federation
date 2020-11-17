import {
  Body,
  Controller,
  Get,
  Post,
  Render,
  Param,
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
import {
  MockIdentityProviderAccountBannedException,
  MockIdentityProviderNoAccountException,
} from '../exceptions';

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
  async getLogin(
    @Req() req,
    @Res() res,
    @Param('uid') interactionId,
    @Body() body: SignInDTO,
  ): Promise<void> {
    const identity: Identity = await this.mockIdentityProviderFcaService.getIdentity(
      body.login,
    );

    // Throw a Y180002 if no account found
    if (!identity) {
      throw new MockIdentityProviderNoAccountException();
    }

    // Throw a Y180001 if the account (../data/database-mock.csv) is restricted.
    if (identity.uid === 'E000001') {
      throw new MockIdentityProviderAccountBannedException();
    }

    const spIdentity: IOidcIdentity = {
      ...identity,
      sub: identity.uid,
    };

    // Save in session
    /**
     * @todo
     * - Set the eIDAS level in a configuration file
     * - Transform the sessiosninit into
     */
    const { spAcr } = await this.session.get(interactionId);

    this.session.patch(interactionId, {
      spIdentity,
    });

    const result = {
      login: {
        account: interactionId,
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
