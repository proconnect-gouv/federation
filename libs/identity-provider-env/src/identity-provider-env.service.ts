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
  private identityProviderCache: IdentityProviderMetadata[];

  constructor(
    private readonly cryptography: CryptographyService,
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  private async findAllIdentityProvider(): Promise<IdentityProviderEnvDTO[]> {
    const { discoveryUrl, provider } = this.config.get<IdentityProviderEnvConfig>('IdentityProviderEnv');

    const configuration = [
      {
        uid: 'corev2',
        name: 'corev2',
        active: true,
        display: true,
        discoveryUrl,
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
  async getList(refreshCache = false): Promise<IdentityProviderMetadata[]> {
    if (refreshCache || !this.identityProviderCache) {
      const list: IIdentityProviderEnv[] = await this.findAllIdentityProvider();

      this.identityProviderCache = list.map(
        this.legacyToOpenIdPropertyName.bind(this),
      );
    }
    return this.identityProviderCache;
  }

  async getById(
    id: string,
    refreshCache = false,
  ): Promise<IdentityProviderMetadata> {
    const providers = await this.getList(refreshCache);

    return providers.find(({ uid }) => uid === id);
  }

  private legacyToOpenIdPropertyName(
    source: IIdentityProviderEnv,
  ): IdentityProviderMetadata {
    // openid defined property names
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const client_secret = this.cryptography.decryptClientSecret(
      source.client_secret,
    );

    const result = {
      ...source,
      // openid defined property names
      // eslint-disable-next-line @typescript-eslint/naming-convention
      client_secret,
    };

    return result as IdentityProviderMetadata;
  }
}
