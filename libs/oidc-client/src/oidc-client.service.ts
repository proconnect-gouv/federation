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
import { IIdPManagementService } from './interfaces';
import { IDP_MANAGEMENT_SERVICE } from './tokens';

@Injectable()
export class OidcClientService {
  private configuration: OidcClientConfig;
  private IssuerProxy = Issuer;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    @Inject(IDP_MANAGEMENT_SERVICE)
    private readonly idpManagementService: IIdPManagementService,
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
    providerId: string,
    // acr_values is an oidc defined variable name
    // eslint-disable-next-line @typescript-eslint/camelcase
    acr_values: string,
    req,
  ): Promise<string> {
    const client: Client = await this.createOidcClient(providerId);

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

  /** @TODO interface tokenSet, to see what we keep ? */
  async getTokenSet(req, providerId: string): Promise<TokenSet> {
    const clientMetadata = await this.getProvider(providerId);
    const client = await this.createOidcClient(providerId);

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
  async getUserInfo(accessToken: string, providerId: string): Promise<object> {
    /** @TODO Retrieve this info */
    const client = await this.createOidcClient(providerId);
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

  private async createOidcClient(providerId: string): Promise<Client> {
    const clientMetadata = this.getProvider(providerId);
    /**
     * Cast to string since well_known_url is not in type `ClientMetadata`.
     * It does no harm to add this parameter though
     * @see https://github.com/panva/node-openid-client/blob/master/docs/README.md#new-issuermetadata
     */
    const wellKnownUrl = clientMetadata.well_known_url as string;
    /**
     * @TODO handle network failure with specific Exception / error code
     */
    const issuer = await this.IssuerProxy.discover(wellKnownUrl);

    return new issuer.Client(clientMetadata);
  }

  /**
   * @param providerId identifier used to indicate choosen IdP
   * @returns providers metadata
   * @throws Error
   */
  private getProvider(providerId: string): ClientMetadata {
    const provider = this.configuration.providers.find(
      provider => provider.id === providerId,
    );
    if (!provider) {
      /** @TODO proper error management (specific exception?) */
      throw Error(`Provider not found <${providerId}>`);
    }

    return provider;
  }

  /**
   * Compose full config by merging static parameters from:
   *  - configuration file (some may be coming from environment variables)
   *  - database (IdP configuration)
   */
  private async getConfig(): Promise<OidcClientConfig> {
    const providers = await this.idpManagementService.getList();
    const configuration = this.configService.get<OidcClientConfig>(
      'OidcClient',
    );

    return {
      ...configuration,
      providers,
    };
  }
}
