import { ClientMetadata, KoaContextWithOIDC } from 'oidc-provider';

import { Inject, Injectable } from '@nestjs/common';

import { ConfigService } from '@fc/config';
import {
  IServiceProviderAdapter,
  SERVICE_PROVIDER_SERVICE_TOKEN,
} from '@fc/oidc';

import { OidcProviderRedisAdapter } from '../adapters';
import { OidcProviderConfig } from '../dto';
import { OidcProviderService } from '../oidc-provider.service';
import { OidcProviderConfigAppService } from './oidc-provider-config-app.service';

@Injectable()
export class OidcProviderConfigService {
  constructor(
    private readonly config: ConfigService,
    private readonly oidcProviderConfigApp: OidcProviderConfigAppService,
    @Inject(SERVICE_PROVIDER_SERVICE_TOKEN)
    private readonly serviceProvider: IServiceProviderAdapter,
  ) {}

  /**
   * Compose full config by merging static parameters from:
   *  - configuration file (some may be coming from environment variables).
   *  - database (SP configuration).
   *
   * @param {boolean} refresh Default false
   * @returns {OidcProviderConfig}
   */
  getConfig(oidcProviderService: OidcProviderService): OidcProviderConfig {
    /**
     * Build our memory adapter for oidc-provider
     * @see https://github.com/panva/node-oidc-provider/tree/master/docs#adapter
     *
     * We can't use nest DI for our adapter.
     * `oidc-provider` wants a class and instantiate the adapter on its own.
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
     * we need add them to constructor and to pass them along here.
     */
    const adapter = OidcProviderRedisAdapter.getConstructorWithDI(
      oidcProviderService,
      this.serviceProvider,
    );

    /**
     * Get data from config file
     */
    const {
      prefix,
      issuer,
      configuration,
      forcedPrompt,
      allowedPrompt,
      isLocalhostAllowed,
    } = this.config.get<OidcProviderConfig>('OidcProvider');

    /**
     * Bind callbacks to this class before passing them to oidc-provider,
     * so we can use the NestJS dependencies injection
     */
    const logoutSource = this.oidcProviderConfigApp.logoutSource.bind(
      this.oidcProviderConfigApp,
    );
    const postLogoutSuccessSource =
      this.oidcProviderConfigApp.postLogoutSuccessSource.bind(
        this.oidcProviderConfigApp,
      );

    const findAccount = this.oidcProviderConfigApp.findAccount.bind(
      this.oidcProviderConfigApp,
    );
    const renderError = this.oidcProviderConfigApp.renderError;
    const clientBasedCORS = this.clientBasedCORS.bind(this);
    const url = this.url.bind(this, prefix);

    /**
     * Build final configuration object
     */
    const oidcProviderConfig: OidcProviderConfig = {
      forcedPrompt,
      allowedPrompt,
      prefix,
      issuer,
      configuration: {
        ...configuration,
        features: {
          ...configuration.features,
          rpInitiatedLogout: {
            ...configuration.features.rpInitiatedLogout,
            logoutSource,
            postLogoutSuccessSource,
          },
        },
        adapter,
        findAccount,
        renderError,
        clientBasedCORS,
        interactions: { url },
        loadExistingGrant: this.loadExistingGrant,
        pkce: {
          methods: ['S256'],
          required: () => false,
        },
      },
      isLocalhostAllowed: Boolean(isLocalhostAllowed),
    };

    return oidcProviderConfig;
  }

  private clientBasedCORS(
    _ctx: KoaContextWithOIDC,
    _origin: unknown,
    _client: ClientMetadata,
  ) {
    return false;
  }

  /**
   * @todo #1023 je type les entrées et sortie correctement et non pas avec any
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/1023
   * @ticket #FC-1023
   */
  /**
   * More documentation can be found in oidc-provider repo
   * @see https://github.com/panva/node-oidc-provider/blob/master/docs/README.md#interactionsurl
   */
  private url(prefix: string, _ctx: KoaContextWithOIDC, interaction: any) {
    return `${prefix}/interaction/${interaction.uid}`;
  }

  /* istanbul ignore next */
  private async loadExistingGrant(ctx) {
    // We want to skip the consent
    // inspired from https://github.com/panva/node-oidc-provider/blob/main/recipes/skip_consent.md
    // We updated the function to ensure it always return a grant.
    // As a consequence, the consent prompt should never be requested afterward.

    // The grant id never comes from consent results, so we simplified this line
    if (!ctx.oidc.session || !ctx.oidc.client || !ctx.oidc.params) {
      return undefined;
    }
    const oidcContextParams = ctx.oidc.params;
    const grantId = ctx.oidc.session.grantIdFor(ctx.oidc.client.clientId);

    let grant;

    if (grantId) {
      grant = await ctx.oidc.provider.Grant.find(grantId);
      // if the grant has expired, the grant can be undefined at this point.
      if (grant) {
        // Keep grant expiry aligned with session expiry to prevent consent
        // prompt being requested when the grant is about to expire.
        // The original code is overkill as session length is extended on every
        // interaction.

        const sessionTtlInSeconds = 14 * 24 * 60 * 60;
        grant.exp = Math.floor(Date.now() / 1000) + sessionTtlInSeconds;
        await grant.save();
      }
    }

    if (!grant) {
      grant = new ctx.oidc.provider.Grant({
        clientId: ctx.oidc.client.clientId,
        accountId: ctx.oidc.session.accountId,
      });
    }

    // event existing grant should be updated, as requested scopes might
    // be different
    grant.addOIDCScope(oidcContextParams.scope);
    grant.addOIDCClaims(Array.from(ctx.oidc.requestParamClaims || []));

    await grant.save();
    return grant;
  }
}
