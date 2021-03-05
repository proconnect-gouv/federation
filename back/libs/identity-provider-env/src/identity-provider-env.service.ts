import { Injectable } from '@nestjs/common';
import {
  IIdentityProviderService,
  IdentityProviderMetadata,
} from '@fc/oidc-client';
import { CryptographyService } from '@fc/cryptography';
import { LoggerService } from '@fc/logger';
import { asyncFilter, validateDto } from '@fc/common';
import { ConfigService, validationOptions } from '@fc/config';
import { IIdentityProviderEnv } from './interfaces';
import { IdentityProviderEnvDTO, IdentityProviderEnvConfig } from './dto';

@Injectable()
export class IdentityProviderEnvService implements IIdentityProviderService {
  private identityProviderCache: IdentityProviderMetadata<any>[];

  constructor(
    private readonly cryptography: CryptographyService,
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  private async findAllIdentityProvider(): Promise<IdentityProviderEnvDTO[]> {
    const {
      discoveryUrl,
      discovery,
      provider,
    } = this.config.get<IdentityProviderEnvConfig>('IdentityProviderEnv');

    const configuration = [
      {
        uid: 'envIssuer',
        name: 'envIssuer',
        title: 'envIssuer Title',
        active: true,
        display: true,
        discoveryUrl,
        discovery,
        ...provider,
      },
    ];

    const result: any = await asyncFilter(
      configuration,
      async (configuration) => {
        const errors = await validateDto(
          configuration,
          IdentityProviderEnvDTO,
          validationOptions,
        );

        if (errors.length > 0) {
          this.logger.warn(
            `"${configuration.uid}" was excluded from the result at DTO validation`,
            JSON.stringify(errors),
          );
        }

        return errors.length === 0;
      },
    );
    return result.map((configuration) => configuration);
  }

  /**
   * @param refreshCache  Should we refreshCache the cache made by the service?
   */
  async getList<T = any>(
    refreshCache?: boolean,
  ): Promise<IdentityProviderMetadata<T>[]> {
    if (refreshCache || !this.identityProviderCache) {
      const list: IIdentityProviderEnv[] = await this.findAllIdentityProvider();

      this.identityProviderCache = list.map(
        this.legacyToOpenIdPropertyName.bind(this),
      );
    }

    return this.identityProviderCache;
  }

  /**
   * Method triggered when you want to filter identity providers
   * from service providers's whitelist/blacklist
   * @param idpList  list of identity providers's clientId
   * @param isBlackListed  boolean false = blacklist true = whitelist
   */
  async getFilteredList(
    idpList: string[],
    blacklist: boolean,
  ): Promise<IdentityProviderMetadata[]> {
    const providers = await this.getList();
    const filteredProviders = providers.filter(({ uid }) => {
      const idpFound = idpList.includes(uid);

      return blacklist ? !idpFound : idpFound;
    });
    return filteredProviders;
  }

  async getById<T = Record<string, any>>(
    id: string,
    refreshCache = false,
  ): Promise<IdentityProviderMetadata<T>> {
    const providers = await this.getList<T>(refreshCache);

    return providers.find(({ uid }) => uid === id);
  }

  private legacyToOpenIdPropertyName(
    source: IIdentityProviderEnv,
  ): IdentityProviderMetadata {
    // openid defined property names
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const client_secret = this.decryptClientSecret(source.client_secret);

    const result = {
      ...source,
      // openid defined property names
      // eslint-disable-next-line @typescript-eslint/naming-convention
      client_secret,
    };

    /**
     * @TODO Fix type issues between legacy model and `oidc-client` library
     * We have non blocking incompatilities.
     */
    return (result as unknown) as IdentityProviderMetadata;
  }

  /**
   * Decrypt client secrect with specific key provided by configuration
   *
   * @param clientSecret
   */
  private decryptClientSecret(clientSecret: string): string {
    const { clientSecretEcKey } = this.config.get<IdentityProviderEnvConfig>(
      'Cryptography',
    );
    return this.cryptography.decrypt(
      clientSecretEcKey,
      Buffer.from(clientSecret, 'base64'),
    );
  }
}
