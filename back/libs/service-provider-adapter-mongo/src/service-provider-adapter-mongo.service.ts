import { Model } from 'mongoose';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { asyncFilter, validateDto } from '@fc/common';
import { ConfigService, validationOptions } from '@fc/config';
import { CryptographyService } from '@fc/cryptography';
import { LoggerService } from '@fc/logger';
import { MongooseCollectionOperationWatcherHelper } from '@fc/mongoose';
import { IServiceProviderAdapter, ServiceProviderMetadata } from '@fc/oidc';

import {
  ServiceProviderAdapterMongoConfig,
  ServiceProviderAdapterMongoDTO,
} from './dto';
import { MongoRequestFilterArgument } from './interfaces';
import { ServiceProvider } from './schemas';

@Injectable()
export class ServiceProviderAdapterMongoService
  implements IServiceProviderAdapter
{
  private listCache: ServiceProviderMetadata[];

  // Dependency injection can require more than 4 parameters
  /* eslint-disable-next-line max-params */
  constructor(
    @InjectModel('ServiceProvider')
    private readonly serviceProviderModel: Model<ServiceProvider>,
    private readonly cryptography: CryptographyService,
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly mongooseWatcher: MongooseCollectionOperationWatcherHelper,
  ) {}

  async onModuleInit() {
    this.mongooseWatcher.watchWith<ServiceProvider>(
      this.serviceProviderModel,
      this.refreshCache.bind(this),
    );
    // Warm up cache and shows up excluded SpPs
    await this.getList();
  }

  async refreshCache(): Promise<void> {
    await this.getList(true);
  }

  private async findAllServiceProvider(): Promise<ServiceProviderMetadata[]> {
    const requestFilterArgument: MongoRequestFilterArgument = {
      active: true,
    };

    const rawResult = await this.serviceProviderModel
      .find(requestFilterArgument, {
        _id: false,
        active: true,
        name: true,
        title: true,
        key: true,
        entityId: true,
        client_secret: true,
        scopes: true,
        redirect_uris: true,
        post_logout_redirect_uris: true,
        id_token_signed_response_alg: true,
        userinfo_signed_response_alg: true,
        jwks_uri: true,
        type: true,
      })
      .lean();

    const serviceProviders = await asyncFilter<ServiceProviderMetadata[]>(
      rawResult,
      async (doc: ServiceProviderMetadata) => {
        const { name, uid } = doc;

        const errors = await validateDto(
          doc,
          ServiceProviderAdapterMongoDTO,
          validationOptions,
        );

        if (errors.length > 0) {
          this.logger.alert(
            `Service provider "${name}" (${uid}) was excluded at DTO validation`,
          );

          this.logger.debug({ errors });
        }

        return errors.length === 0;
      },
    );

    return serviceProviders;
  }

  /**
   * @param refreshCache  Should we refreshCache the cache made by the service?
   */
  async getList(refreshCache = false): Promise<ServiceProviderMetadata[]> {
    if (refreshCache || !this.listCache) {
      this.logger.debug('Refresh cache from DB');

      const list = await this.findAllServiceProvider();
      this.listCache = list.map(this.legacyToOpenIdPropertyName.bind(this));
    }

    return this.listCache;
  }

  async getById(
    spId: string,
    refreshCache = false,
  ): Promise<ServiceProviderMetadata> {
    const list = await this.getList(refreshCache);
    const serviceProvider: ServiceProviderMetadata = list.find(
      ({ client_id: dbId }) => dbId === spId,
    );

    return serviceProvider;
  }

  private legacyToOpenIdPropertyName(
    source: ServiceProvider,
  ): ServiceProviderMetadata {
    const client_id = source.key;
    const client_secret = this.decryptClientSecret(source.client_secret);
    const scope = source.scopes.join(' ');

    const result = {
      ...source,
      client_id,
      client_secret,
      scope,
    };

    delete result.key;
    delete result.scopes;

    return result as ServiceProviderMetadata;
  }

  private decryptClientSecret(clientSecret: string): string {
    const { clientSecretEncryptKey } =
      this.config.get<ServiceProviderAdapterMongoConfig>(
        'ServiceProviderAdapterMongo',
      );
    return this.cryptography.decrypt(
      clientSecretEncryptKey,
      Buffer.from(clientSecret, 'base64'),
    );
  }
}
