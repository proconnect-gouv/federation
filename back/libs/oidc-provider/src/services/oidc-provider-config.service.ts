/**
 * We sadly need `lodash` to override node-oid-provider
 * configuration function that relies on it.
 * @see OidcProviderService.overrideConfiguration()
 */
import { get } from 'lodash';
import Provider, { ClientMetadata, KoaContextWithOIDC } from 'oidc-provider';
import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@fc/config';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';
import { ServiceProviderService } from '@fc/service-provider';
import { RedisAdapter } from '../adapters';
import { OidcProviderConfig } from '../dto';
import { SERVICE_PROVIDER_SERVICE_TOKEN } from '@fc/oidc/tokens';
import { OidcProviderService } from '../oidc-provider.service';
import { OidcProviderErrorService } from './oidc-provider-error.service';

@Injectable()
export class OidcProviderConfigService {
  // Dependency injection can require more than 4 parameters
  // eslint-disable-next-line max-params
  constructor(
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
    private readonly session: SessionService,
    private readonly errorService: OidcProviderErrorService,
    @Inject(SERVICE_PROVIDER_SERVICE_TOKEN)
    private readonly serviceProvider: ServiceProviderService,
  ) {}

  overrideConfiguration(configuration: object, provider: Provider): void {
    /**
     * Use string literral because `configuration` is not exposed
     * by Provider interface
     */
    provider['configuration'] = (path: string) =>
      path ? get(configuration, path) : configuration;
  }

  /**
   * Compose full config by merging static parameters from:
   *  - configuration file (some may be coming from environment variables).
   *  - database (SP configuration).
   *
   * @param {boolean} refresh Default false
   * @returns {Promise<OidcProviderConfig>}
   */
  async getConfig(
    oidcProviderService: OidcProviderService,
  ): Promise<OidcProviderConfig> {
    /**
     * Get SP's information from provided serviceProviderService
     */
    const clients = await this.serviceProvider.getList();

    /**
     * Build our memory adapter for oidc-provider
     * @see https://github.com/panva/node-oidc-provider/tree/master/docs#adapter
     *
     * We can't use nest DI for our adapter.
     * `oidc-provider` wants a class and instantiate the adapter on it's own.
     * @see https://github.com/panva/node-oidc-provider/blob/9306f66bdbcdff01400773f26539cf35951b9ce8/lib/models/client.js#L201
     * @see https://github.com/panva/node-oidc-provider/blob/22cc547ffb45503cf2fc4357958325e0f5ed4b2f/lib/models/base_model.js#L28
     *
     * So we can not use directly NestJs DI to instantiate the adapter.
     *
     * The trick here is simple :
     * 1. We inject needed services in this service (oidcProviderService)
     * 2. We bind them to our adapter constructor.
     * 3. We give the resulting constructor to `oidc-provider`
     *
     * NB: If we want to add more services to the adapter,
     * we need add them to contructor and to pass them along here.
     */
    const adapter = RedisAdapter.getConstructorWithDI(oidcProviderService);

    /**
     * Get data from config file
     */
    const {
      prefix,
      issuer,
      configuration,
      forcedPrompt,
    } = this.config.get<OidcProviderConfig>('OidcProvider');

    /**
     * Build final configuration object
     */
    return {
      forcedPrompt,
      prefix,
      issuer,
      configuration: {
        ...configuration,
        adapter,
        clients,
        findAccount: this.findAccount.bind(this),
        pairwiseIdentifier: this.pairwiseIdentifier.bind(this),
        renderError: this.errorService.renderError.bind(this.errorService),
        rpInitiatedLogout: {
          logoutSource: this.logoutSource.bind(this),
        },
        clientBasedCORS: this.clientBasedCORS.bind(this),
        interactions: { url: this.url.bind(this, prefix) },
      },
    };
  }

  /**
   * Returned object should contains an `accountId` property
   * and an async `claims` function.
   * More documentation can be found in oidc-provider repo.
   * @see https://github.com/panva/node-oidc-provider/blob/master/docs/README.md#accounts
   */
  private async findAccount(ctx, interactionId: string) {
    this.logger.debug('OidcProviderService.findAccount()');

    try {
      const { spIdentity } = await this.session.get(interactionId);

      return {
        accountId: interactionId,
        async claims() {
          return spIdentity;
        },
      };
    } catch (error) {
      // Hacky throw from oidc-provider
      this.errorService.throwError(ctx, error);
    }
  }

  /**
   * Passthru original identifier (sub).
   *
   * While we could imagine that `accountId` would carry the value set by the `findAccount` method above,
   * it actually carries the sub.
   *
   * We kept the parameter name to be consistent with documentation and original function signature
   * Note that the function receives a third parameter `client` but it is of no use for our implementation.
   *
   * @see https://github.com/panva/node-oidc-provider/blob/master/docs/README.md#pairwiseidentifier
   */
  private pairwiseIdentifier(_ctx, accountId: string) {
    return accountId;
  }

  /**
   * More documentation can be found in oidc-provider repo
   * @see https://github.com/panva/node-oidc-provider/blob/master/docs/README.md#logoutsource
   * @TODO #109 Check the behaving of the page when javascript is disabled
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/issues/109
   */
  private async logoutSource(ctx: KoaContextWithOIDC, form: any) {
    ctx.body = `<!DOCTYPE html>
      <head>
        <title>Logout</title>
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

  private clientBasedCORS(
    _ctx: KoaContextWithOIDC,
    _origin: unknown,
    _client: ClientMetadata,
  ) {
    return false;
  }

  /**
   * More documentation can be found in oidc-provider repo
   * @see https://github.com/panva/node-oidc-provider/blob/master/docs/README.md#interactionsurl
   */
  private async url(
    prefix: string,
    ctx: KoaContextWithOIDC,
    _interaction: unknown,
  ) {
    return `${prefix}/interaction/${ctx.oidc.uid}`;
  }
}
