import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { validateDto, asyncFilter } from '@fc/common';
import { validationOptions } from '@fc/config';
import {
  ServiceProviderMetadata,
  IServiceProviderService,
} from '@fc/oidc-provider';
import { CryptographyService } from '@fc/cryptography';
import { LoggerService } from '@fc/logger';
import { EventBus } from '@nestjs/cqrs';
import { IServiceProvider } from './interfaces';
import { ServiceProviderDTO } from './dto';
import { ServiceProviderOperationTypeChangesEvent } from './events';

@Injectable()
export class ServiceProviderService implements IServiceProviderService {
  private listCache: ServiceProviderMetadata[];

  constructor(
    @InjectModel('ServiceProvider')
    private readonly serviceProviderModel,
    private readonly cryptography: CryptographyService,
    private readonly eventBus: EventBus,
    private readonly logger: LoggerService,
  ) {}

  async onModuleInit() {
    this.initOperationTypeWatcher();
    this.logger.debug('Initializing service-provider');
  }

  private initOperationTypeWatcher(): void {
    const watch: any = this.serviceProviderModel.watch();
    this.logger.debug(
      `Service's database OperationType watcher initialization.`,
    );
    watch.driverChangeStream.cursor.on(
      'data',
      this.operationTypeWatcher.bind(this),
    );
  }

  /**
   * Method triggered when an operation type occured on
   * Mongo's 'provider' collection.
   * @param {object} stream Stream of event retrieved.
   * @returns {void}
   */
  private operationTypeWatcher(stream): void {
    const operationTypes = ['insert', 'update', 'delete', 'rename', 'replace'];
    const isOperationListened: boolean = operationTypes.includes(
      stream.operationType,
    );

    if (isOperationListened === true) {
      this.eventBus.publish(new ServiceProviderOperationTypeChangesEvent());
    }
  }

  private async findAllServiceProvider(): Promise<IServiceProvider[]> {
    const rawResult = await this.serviceProviderModel
      .find(
        {
          active: true,
        },
        {
          _id: false,
          active: true,
          name: true,
          key: true,
          // openid defined property names
          // eslint-disable-next-line @typescript-eslint/naming-convention
          client_secret: true,
          scopes: true,
          // openid defined property names
          // eslint-disable-next-line @typescript-eslint/naming-convention
          redirect_uris: true,
          // openid defined property names
          // eslint-disable-next-line @typescript-eslint/naming-convention
          post_logout_redirect_uris: true,
          // openid defined property names
          // eslint-disable-next-line @typescript-eslint/naming-convention
          id_token_signed_response_alg: true,
          // openid defined property names
          // eslint-disable-next-line @typescript-eslint/naming-convention
          id_token_encrypted_response_alg: true,
          // openid defined property names
          // eslint-disable-next-line @typescript-eslint/naming-convention
          id_token_encrypted_response_enc: true,
          // openid defined property names
          // eslint-disable-next-line @typescript-eslint/naming-convention
          userinfo_signed_response_alg: true,
          // openid defined property names
          // eslint-disable-next-line @typescript-eslint/naming-convention
          userinfo_encrypted_response_alg: true,
          // openid defined property names
          // eslint-disable-next-line @typescript-eslint/naming-convention
          userinfo_encrypted_response_enc: true,
          // openid defined property names
          // eslint-disable-next-line @typescript-eslint/naming-convention
          jwks_uri: true,
        },
      )
      .exec();

    const result: any = await asyncFilter(rawResult, async ({ _doc }) => {
      const errors = await validateDto(
        _doc,
        ServiceProviderDTO,
        validationOptions,
      );

      if (errors.length > 0) {
        this.logger.warn(
          `"${_doc.name}" was excluded from the result at DTO validation`,
        );
      }

      return errors.length === 0;
    });

    return result.map(({ _doc }) => _doc);
  }

  /**
   * @param refreshCache  Should we refreshCache the cache made by the service?
   */
  async getList(refreshCache = false): Promise<ServiceProviderMetadata[]> {
    if (refreshCache || !this.listCache) {
      const list: IServiceProvider[] = await this.findAllServiceProvider();

      this.listCache = list.map(this.legacyToOpenIdPropertyName.bind(this));
    }

    return this.listCache;
  }

  async getById(
    id: string,
    refreshCache = false,
  ): Promise<ServiceProviderMetadata> {
    const list = await this.getList(refreshCache);
    // openid defined property names
    // eslint-disable-next-line @typescript-eslint/naming-convention
    return list.find(({ client_id: dbId }) => dbId === id);
  }

  private legacyToOpenIdPropertyName(
    source: IServiceProvider,
  ): ServiceProviderMetadata {
    // openid defined property names
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const client_id = source.key;
    // openid defined property names
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const client_secret = this.cryptography.decryptClientSecret(
      source.client_secret,
    );
    const scope = source.scopes.join(' ');

    const result = {
      ...source,
      // openid defined property names
      // eslint-disable-next-line @typescript-eslint/naming-convention
      client_id,
      // openid defined property names
      // eslint-disable-next-line @typescript-eslint/naming-convention
      client_secret,
      scope,
    };

    delete result.key;
    delete result.scopes;

    return result as ServiceProviderMetadata;
  }
}
