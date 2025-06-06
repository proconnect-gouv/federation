import {
  InteractionResults,
  KoaContextWithOIDC,
  Provider,
} from 'oidc-provider';

import { Injectable } from '@nestjs/common';

import { ConfigService } from '@fc/config';
import { UserSession } from '@fc/core-fca';
import { throwException } from '@fc/exceptions/helpers';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';

import { OidcProviderRuntimeException } from '../exceptions';
import { LogoutFormParamsInterface } from '../interfaces';
import { OidcProviderErrorService } from './oidc-provider-error.service';

@Injectable()
export abstract class OidcProviderAppConfigLibService {
  protected provider: Provider;

  // Dependency injection can require more than 4 parameters
  constructor(
    protected readonly _logger: LoggerService,
    protected readonly sessionService: SessionService,
    protected readonly errorService: OidcProviderErrorService,
    protected readonly config: ConfigService,
  ) {}

  /**
   * More documentation can be found in oidc-provider repo
   * @see https://github.com/panva/node-oidc-provider/blob/v6.x/docs/README.md#featuresrpinitiatedlogout
   * @TODO #109 Check the behaving of the page when javascript is disabled
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/issues/109
   */
  logoutSource(ctx: KoaContextWithOIDC, form: any): void {
    ctx.body = `<!DOCTYPE html>
      <head>
        <title>Déconnexion</title>
      </head>
      <body>
        ${form}
        <script>
          var form = document.forms[0];
          var input = document.createElement('input');
          input.type = 'hidden';
          input.name = 'logout';
          input.value = 'yes';
          form.appendChild(input);
          form.submit();
        </script>
      </body>
    </html>`;
  }

  /**
   * More documentation can be found in oidc-provider repo
   * @see https://github.com/panva/node-oidc-provider/blob/v6.x/docs/README.md#featuresrpinitiatedlogout
   * @TODO #109 Check the behaving of the page when javascript is disabled
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/issues/109
   */
  postLogoutSuccessSource(ctx: KoaContextWithOIDC) {
    ctx.body = `<!DOCTYPE html>
        <head>
          <title>Déconnexion</title>
        </head>
        <body>
          <p>Vous êtes bien déconnecté, vous pouvez fermer votre navigateur.</p>
        </body>
        </html>`;
  }

  /**
   * Returned object should contains an `accountId` property
   * and an async `claims` function.
   * More documentation can be found in oidc-provider repo.
   * @see https://github.com/panva/node-oidc-provider/blob/master/docs/README.md#accounts
   */
  async findAccount(
    _ctx: KoaContextWithOIDC,
    sessionId: string,
  ): Promise<{ accountId: string; claims: Function }> {
    try {
      // Use the user session from the service provider request
      await this.sessionService.initCache(sessionId);

      const { spIdentity } = this.sessionService.get<UserSession>('User');

      return {
        /**
         * We used the `sessionId` as `accountId` identifier when building the grant
         * @see OidcProviderService.finishInteraction()
         */
        accountId: sessionId,
        // eslint-disable-next-line require-await
        async claims() {
          return { ...spIdentity };
        },
      };
    } catch (error) {
      // Hacky throw from oidc-provider
      await throwException(error);
    }
  }

  async finishInteraction(
    req: any,
    res: any,
    {
      amr,
      acr,
    }: {
      amr: InteractionResults['login']['amr'];
      acr: InteractionResults['login']['acr'];
    },
  ) {
    const sessionId = this.sessionService.getId();

    /**
     * Build Interaction results
     * For all available options, refer to `oidc-provider` documentation:
     * @see https://github.com/panva/node-oidc-provider/blob/master/docs/README.md#user-flows
     *
     * We use `sessionId` as `accountId` in order to to easily retrieve the session for back channel requests
     * @see OidcProviderConfigService.findAccount()
     */
    const result = {
      login: {
        amr,
        acr,
        accountId: sessionId,
        ts: Math.floor(Date.now() / 1000),
        remember: false,
      },
      // skip the consent
      consent: {},
    } as InteractionResults;

    try {
      return await this.provider.interactionFinished(req, res, result);
    } catch (error) {
      throw new OidcProviderRuntimeException(error);
    }
  }

  /**
   * Set provider implementation from OidcProviderService
   * @param provider
   */
  setProvider(provider: Provider): void {
    this.provider = provider;
  }

  async logoutFormSessionDestroy(
    ctx: KoaContextWithOIDC,
    form: any,
    { method, uri, title }: LogoutFormParamsInterface,
  ): Promise<void> {
    this.sessionService.set('User', 'oidcProviderLogoutForm', form);
    await this.sessionService.commit();

    ctx.body = `<!DOCTYPE html>
      <head>
        <title>${title}</title>
      </head>
      <body>
        <form method="${method}" action="${uri}">
        </form>
        <script>
          var form = document.forms[0];
          form.submit();
        </script>
      </body>
    </html>`;
  }

  getServiceProviderIdFromCtx(ctx: KoaContextWithOIDC): string | undefined {
    return ctx.oidc?.entities?.Client?.clientId;
  }
}
