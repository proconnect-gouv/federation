import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@fc/config';
import { LoggerService } from '@fc/logger';
import { OidcClientConfig } from '../dto';
import { IIdentityProviderService } from '../interfaces';
import { IDENTITY_PROVIDER_SERVICE } from '../tokens';

@Injectable()
export class OidcClientConfigService {
  /**
   * @todo [FC-231] Prossibly the source of the idps refresh problem
   * Never used
   */
  private configuration: OidcClientConfig;

  constructor(
    readonly config: ConfigService,
    private readonly logger: LoggerService,
    @Inject(IDENTITY_PROVIDER_SERVICE)
    private readonly identityProvider: IIdentityProviderService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  async onModuleInit() {
    this.reload();
    this.logger.debug('Initializing oidc-client');
  }

  /**
   * Reload of oidc-client configuration
   */
  public async reload(): Promise<void> {
    this.configuration = await this.get(true);
    this.logger.debug(`Reload oidc-client configuration.`);
  }

  /**
   * Compose full config by merging static parameters from:
   *  - configuration file (some may be coming from environment variables)
   *  - database (IdP configuration)
   */
  public async get(refresh = false): Promise<OidcClientConfig> {
    const providers = await this.identityProvider.getList(refresh);
    const configuration = this.config.get<OidcClientConfig>('OidcClient');

    return {
      ...configuration,
      providers,
    };
  }
}
