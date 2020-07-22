import * as fs from 'fs';
import { JWK } from 'jose';
import { Injectable, Inject } from '@nestjs/common';
import {
  Issuer,
  TokenSet,
  generators,
  Client,
  ClientMetadata,
  custom,
  HttpOptions,
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
import { IOidcIdentity } from '@fc/oidc';

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

  async getAuthorizeUrl(
    scope: string,
    providerUid: string,
    // acr_values is an oidc defined variable name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    acr_values: string,
  ): Promise<string> {
    const client: Client = await this.createOidcClient(providerUid);

    const state = generators.state();

    return client.authorizationUrl({
      scope,
      state,
      // oidc defined variable name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values,
      prompt: 'login',
    });
  }

  async wellKnownKeys() {
    const config = this.config.get<OidcClientConfig>('OidcClient');

    const privateKeys = config.jwks.keys;

    const publicKeys = privateKeys.map((key) => JWK.asKey(key as any).toJWK());

    return { keys: publicKeys };
  }

  async getTokenSet(req, providerUid: string): Promise<TokenSet> {
    this.logger.trace('getTokenSet');
    const clientMetadata = await this.getProvider(providerUid);
    const client = await this.createOidcClient(providerUid);

    this.setCustomHttpOptions(client);

    const params = await client.callbackParams(req);

    const tokenSet = await client.callback(
      clientMetadata.redirect_uris.join(','),
      params,
      {
        state: params.state,
        // oidc defined variable name
        // eslint-disable-next-line @typescript-eslint/naming-convention
        response_type: clientMetadata.response_types.join(','),
      },
    );

    return tokenSet;
  }

  async getUserInfo(
    accessToken: string,
    providerUid: string,
  ): Promise<IOidcIdentity> {
    this.logger.trace('getUserInfo');
    const client = await this.createOidcClient(providerUid);

    this.setCustomHttpOptions(client);

    return client.userinfo(accessToken);
  }

  /**
   * Scheduled reload of oidc-provider configuration
   */
  private async scheduleConfigurationReload(): Promise<void> {
    this.configuration = await this.getConfig(true);
    this.logger.debug(
      `Reload configuration (reloadConfigDelayInMs:${this.configuration.reloadConfigDelayInMs})`,
    );

    // Schedule next call, N seconds after END of this one
    setTimeout(
      this.scheduleConfigurationReload,
      this.configuration.reloadConfigDelayInMs,
    );
  }

  private async createOidcClient(providerUid: string): Promise<Client> {
    const clientMetadata = this.getProvider(providerUid);
    const { jwks } = this.config.get<OidcClientConfig>('OidcClient');

    /**
     * Cast to string since discoveryUrl is not in type `ClientMetadata`.
     * It does no harm to add this parameter though
     * @see https://github.com/panva/node-openid-client/blob/master/docs/README.md#new-issuermetadata
     */
    const wellKnownUrl = clientMetadata.discoveryUrl as string;
    /**
     * @TODO #142 handle network failure with specific Exception / error code
     * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/142
     */
    const issuer = await this.IssuerProxy.discover(wellKnownUrl);

    return new issuer.Client(clientMetadata, jwks);
  }

  /**
   * @param providerUid identifier used to indicate choosen IdP
   * @returns providers metadata
   * @throws Error
   */
  private getProvider(providerUid: string): ClientMetadata {
    const provider = this.configuration.providers.find(
      ({ uid }) => uid === providerUid,
    );

    if (!provider) {
      throw new OidcClientProviderNotFoundException(providerUid);
    }

    if (!provider.active) {
      throw new OidcClientProviderDisabledException(providerUid);
    }

    return provider;
  }

  /**
   * Compose full config by merging static parameters from:
   *  - configuration file (some may be coming from environment variables)
   *  - database (IdP configuration)
   */
  private async getConfig(refresh = false): Promise<OidcClientConfig> {
    const providers = await this.identityProvider.getList(refresh);
    const configuration = this.config.get<OidcClientConfig>('OidcClient');

    return {
      ...configuration,
      providers,
    };
  }

  /**
   * Set custom http options
   * @param client
   * @see https://github.com/panva/node-openid-client/blob/master/docs/README.md#customizing-individual-http-requests
   */
  private setCustomHttpOptions(client): void {
    client[custom.http_options] = this.retrieveHttpOptions.bind(this);
  }

  private retrieveHttpOptions(options): HttpOptions {
    options.cert = fs.readFileSync(this.configuration.httpOptions.cert);
    options.key = fs.readFileSync(this.configuration.httpOptions.key);
    return options;
  }
}
