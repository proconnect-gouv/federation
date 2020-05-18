import { JWK } from 'jose';
import { Injectable, Inject } from '@nestjs/common';
import {
  Issuer,
  TokenSet,
  generators,
  Client,
  ClientMetadata,
} from 'openid-client';

import { ConfigService } from '@fc/config';
import { LoggerService } from '@fc/logger';
import { OidcClientConfig } from './dto';
import { IIdentityProviderService } from './interfaces';
import { IDENTITY_PROVIDER_SERVICE } from './tokens';
import {
  OidcClientProviderNotFoundException,
  OidcClientProviderDisabledException,
} from './exceptions';

@Injectable()
export class OidcClientService {
  private configuration: OidcClientConfig;
  private IssuerProxy = Issuer;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    @Inject(IDENTITY_PROVIDER_SERVICE)
    private readonly identityProvider: IIdentityProviderService,
  ) {
    this.logger.setContext(this.constructor.name);
    /**
     * Bind only once
     *
     * This methods is called repeatedly via setTimeout
     * thus it needs to be bound to `this`.
     * We bind it once for all in constructor.
     *  - less overhead at each run
     *  - easier to unit test
     */
    this.scheduleConfigurationReload = this.scheduleConfigurationReload.bind(
      this,
    );
  }

  onModuleInit() {
    this.scheduleConfigurationReload();
  }

  /** @TODO validation body by interface */
  async getAuthorizeUrl(
    scope: string,
    providerName: string,
    // acr_values is an oidc defined variable name
    // eslint-disable-next-line @typescript-eslint/camelcase
    acr_values: string,
    req,
  ): Promise<string> {
    const client: Client = await this.createOidcClient(providerName);

    /** @TODO replace by in house crypto */
    const state = generators.state();

    /** @TODO replace by in house crypto? */
    const codeVerifier = generators.codeVerifier();
    const codeChallenge = generators.codeChallenge(codeVerifier);

    /** @TODO store the code_verifier in session mechanism */
    req.session.codeVerifier = codeVerifier;

    return client.authorizationUrl({
      scope,
      state,
      // oidc defined variable name
      // eslint-disable-next-line @typescript-eslint/camelcase
      acr_values,
      // oidc defined variable name
      // eslint-disable-next-line @typescript-eslint/camelcase
      code_challenge: codeChallenge,
      // oidc defined variable name
      // eslint-disable-next-line @typescript-eslint/camelcase
      code_challenge_method: 'S256',
    });
  }

  async wellKnownKeys() {
    const config = this.config.get<OidcClientConfig>('OidcClient');

    const privateKeys = config.jwks.keys;

    const publicKeys = privateKeys.map(key => JWK.asKey(key as any).toJWK());

    return { keys: publicKeys };
  }

  /** @TODO interface tokenSet, to see what we keep ? */
  async getTokenSet(req, providerName: string): Promise<TokenSet> {
    this.logger.trace('getTokenSet');
    const clientMetadata = await this.getProvider(providerName);
    const client = await this.createOidcClient(providerName);

    const params = await client.callbackParams(req);

    const tokenSet = await client.callback(
      clientMetadata.redirect_uris.join(','),
      params,
      {
        state: params.state,
        // oidc defined variable name
        // eslint-disable-next-line @typescript-eslint/camelcase
        code_verifier: req.session.codeVerifier,
        // oidc defined variable name
        // eslint-disable-next-line @typescript-eslint/camelcase
        response_type: clientMetadata.response_types.join(','),
      },
    );

    return tokenSet;
  }

  /**
   * @TODO interface userinfo
   * @TODO handle network error
   */
  async getUserInfo(
    accessToken: string,
    providerName: string,
  ): Promise<object> {
    this.logger.trace('getUserInfo');
    /** @TODO Retrieve this info */
    const client = await this.createOidcClient(providerName);
    return client.userinfo(accessToken);
  }

  /**
   * Scheduled reload of oidc-provider configuration
   */
  private async scheduleConfigurationReload(): Promise<void> {
    this.configuration = await this.getConfig();
    this.logger.debug(
      `Reload configuration (reloadConfigDelayInMs:${this.configuration.reloadConfigDelayInMs})`,
    );

    // Schedule next call, N seconds after END of this one
    setTimeout(
      this.scheduleConfigurationReload,
      this.configuration.reloadConfigDelayInMs,
    );
  }

  private async createOidcClient(providerName: string): Promise<Client> {
    const clientMetadata = this.getProvider(providerName);
    const { jwks } = this.config.get<OidcClientConfig>('OidcClient');

    /**
     * Cast to string since discoveryUrl is not in type `ClientMetadata`.
     * It does no harm to add this parameter though
     * @see https://github.com/panva/node-openid-client/blob/master/docs/README.md#new-issuermetadata
     */
    const wellKnownUrl = clientMetadata.discoveryUrl as string;
    /**
     * @TODO handle network failure with specific Exception / error code
     */
    const issuer = await this.IssuerProxy.discover(wellKnownUrl);

    return new issuer.Client(clientMetadata, jwks);
  }

  /**
   * @param providerName identifier used to indicate choosen IdP
   * @returns providers metadata
   * @throws Error
   */
  private getProvider(providerName: string): ClientMetadata {
    const provider = this.configuration.providers.find(
      ({ name }) => name === providerName,
    );
    if (!provider) {
      throw new OidcClientProviderNotFoundException(providerName);
    }

    if (!provider.active) {
      throw new OidcClientProviderDisabledException(providerName);
    }

    return provider;
  }

  /**
   * Compose full config by merging static parameters from:
   *  - configuration file (some may be coming from environment variables)
   *  - database (IdP configuration)
   */
  private async getConfig(): Promise<OidcClientConfig> {
    const providers = await this.identityProvider.getList();
    const configuration = this.config.get<OidcClientConfig>('OidcClient');

    return {
      ...configuration,
      providers,
    };
  }
}
