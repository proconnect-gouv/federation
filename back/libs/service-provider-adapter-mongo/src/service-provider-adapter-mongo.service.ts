import { ConfigService } from "#libs/config";
import { CryptographyService } from "#libs/cryptography";
import { LoggerService } from "#libs/logger";
import { MongooseCollectionOperationWatcherHelper } from "#libs/mongoose";
import { IServiceProviderAdapter, ServiceProviderMetadata } from "#libs/oidc";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Model } from "mongoose";
import { errors } from "oidc-provider";
import {
  ServiceProviderAdapterMongoConfig,
  ServiceProviderAdapterMongoDTO,
} from "./dto";
import { ServiceProvider } from "./schemas";
import InvalidClient = errors.InvalidClient;

@Injectable()
export class ServiceProviderAdapterMongoService implements IServiceProviderAdapter {
  private listCache: ServiceProviderMetadata[];
  private invalidPropertiesCache = new Map<string, string[]>();

  constructor(
    @InjectModel("ServiceProvider")
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

  private async findAllServiceProvider() {
    const filter = {
      active: true,
    };
    const rawServiceProviders = await this.serviceProviderModel
      .find(filter)
      .lean();

    const serviceProviders = [];
    const invalidProperties = new Map<string, string[]>();

    for (const rawServiceProvider of rawServiceProviders) {
      const serviceProvider = plainToInstance(
        ServiceProviderAdapterMongoDTO,
        rawServiceProvider,
      );
      const errors = await validate(serviceProvider, {
        whitelist: true,
      });

      if (errors.length > 0) {
        this.logger.error({
          msg: `Service provider "${rawServiceProvider?.name}" (${rawServiceProvider?.key}) was excluded at DTO validation`,
          validationErrors: errors,
        });
        invalidProperties.set(
          rawServiceProvider.key,
          errors.map(({ property }) => property),
        );
      } else {
        serviceProviders.push(serviceProvider);
      }
    }

    this.invalidPropertiesCache = invalidProperties;
    return serviceProviders;
  }

  /**
   * @param refreshCache  Should we refreshCache the cache made by the service?
   */
  async getList(refreshCache = false): Promise<ServiceProviderMetadata[]> {
    if (refreshCache || !this.listCache) {
      const allServiceProviders = await this.findAllServiceProvider();
      this.listCache = allServiceProviders.map((serviceProvider) =>
        this.legacyToOpenIdPropertyName(serviceProvider),
      );
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

    const invalidProperties = this.invalidPropertiesCache.get(spId);
    if (!serviceProvider && invalidProperties) {
      throw new InvalidClient(
        `client configuration is invalid: ${invalidProperties.join(", ")}`,
      );
    }

    return serviceProvider;
  }

  private legacyToOpenIdPropertyName(
    source: ServiceProvider,
  ): ServiceProviderMetadata {
    const client_id = source.key;
    const client_secret = this.decryptClientSecret(source.client_secret);
    const scope = source.scopes.join(" ");

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
        "ServiceProviderAdapterMongo",
      );
    return this.cryptography.decrypt(
      clientSecretEncryptKey,
      Buffer.from(clientSecret, "base64"),
    );
  }
}
