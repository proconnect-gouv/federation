import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { validateDto, asyncFilter } from '@fc/common';
import { validationOptions, ConfigService } from '@fc/config';
import {
  IdentityProviderMetadata,
  IIdentityProviderAdapter,
} from '@fc/oidc-client';
import { CryptographyService } from '@fc/cryptography';
import { EventBus } from '@nestjs/cqrs';
import { LoggerService } from '@fc/logger';
import {
  IdentityProviderAdapterMongoDTO,
  IdentityProviderAdapterMongoConfig,
} from './dto';
import { IdentityProvider } from './schemas';
import { IdentityProviderUpdateEvent } from './events';

@Injectable()
export class IdentityProviderAdapterMongoService
  implements IIdentityProviderAdapter
{
  private listCache: IdentityProviderMetadata<any>[];

  // Dependency injection can require more than 4 parameters
  /* eslint-disable-next-line max-params */
  constructor(
    @InjectModel('IdentityProvider')
    private readonly identityProviderModel,
    private readonly crypto: CryptographyService,
    private readonly config: ConfigService,
    private readonly eventBus: EventBus,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  async onModuleInit() {
    this.initOperationTypeWatcher();
    this.logger.debug('Initializing identity-provider');
  }

  private initOperationTypeWatcher(): void {
    const watch: any = this.identityProviderModel.watch();
    this.logger.debug(
      `Provider's database OperationType watcher initialization.`,
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
    const isListenedOperation: boolean = operationTypes.includes(
      stream.operationType,
    );
    if (isListenedOperation) {
      this.eventBus.publish(new IdentityProviderUpdateEvent());
    }
  }

  private async findAllIdentityProvider(): Promise<IdentityProvider[]> {
    const rawResult = await this.identityProviderModel
      .find(
        {},
        {
          _id: false,
          uid: true,
          name: true,
          image: true,
          issuer: true,
          url: true,
          title: true,
          active: true,
          display: true,
          clientID: true,
          // oidc defined variable name
          // eslint-disable-next-line @typescript-eslint/naming-convention
          client_secret: true,
          discovery: true,
          discoveryUrl: true,
          // oidc defined variable name
          // eslint-disable-next-line @typescript-eslint/naming-convention
          redirect_uris: true,
          authzURL: true,
          tokenURL: true,
          userInfoURL: true,
          jwksURL: true,
          // oidc defined variable name
          // eslint-disable-next-line @typescript-eslint/naming-convention
          post_logout_redirect_uris: true,
          // oidc defined variable name
          // eslint-disable-next-line @typescript-eslint/naming-convention
          id_token_encrypted_response_alg: true,
          // oidc defined variable name
          // eslint-disable-next-line @typescript-eslint/naming-convention
          id_token_encrypted_response_enc: true,
          // oidc defined variable name
          // eslint-disable-next-line @typescript-eslint/naming-convention
          userinfo_signed_response_alg: true,
          // oidc defined variable name
          // eslint-disable-next-line @typescript-eslint/naming-convention
          userinfo_encrypted_response_alg: true,
          // oidc defined variable namev
          // eslint-disable-next-line @typescript-eslint/naming-convention
          userinfo_encrypted_response_enc: true,
          // oidc defined variable name
          // eslint-disable-next-line @typescript-eslint/naming-convention
          response_types: true,
          // oidc defined variable name
          // eslint-disable-next-line @typescript-eslint/naming-convention
          id_token_signed_response_alg: true,
          // oidc defined variable name
          // eslint-disable-next-line @typescript-eslint/naming-convention
          token_endpoint_auth_method: true,
          // openid defined property names
          // eslint-disable-next-line @typescript-eslint/naming-convention
          revocation_endpoint_auth_method: true,
          featureHandlers: true,
        },
      )
      .exec();

    const result: any = await asyncFilter(rawResult, async ({ _doc }) => {
      const errors = await validateDto(
        _doc,
        IdentityProviderAdapterMongoDTO,
        validationOptions,
      );

      if (errors.length > 0) {
        this.logger.warn(
          `"${
            _doc.uid
          }" was excluded from the result at DTO validation. ${JSON.stringify(
            errors,
            null,
            2,
          )}`,
        );
      }

      return errors.length === 0;
    });

    const identityProviders: IdentityProvider[] = result.map(
      ({ _doc }) => _doc,
    );

    this.logger.trace({ identityProviders });

    return identityProviders;
  }

  /**
   * @param refreshCache  Should we refreshCache the cache made by the service?
   */
  async getList<T = any>(
    refreshCache?: boolean,
  ): Promise<IdentityProviderMetadata<T>[]> {
    if (refreshCache || !this.listCache) {
      this.logger.debug('Refresh cache from DB');
      const list: IdentityProvider[] = await this.findAllIdentityProvider();
      this.listCache = list.map(this.legacyToOpenIdPropertyName.bind(this));

      this.logger.trace({ step: 'REFRESH', list: this.listCache });
    } else {
      this.logger.trace({ step: 'CACHE', list: this.listCache });
    }

    return this.listCache;
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

    this.logger.trace({ idpList, blacklist, filteredProviders });

    return filteredProviders;
  }

  async getById<T = Record<string, any>>(
    id: string,
    refreshCache = false,
  ): Promise<IdentityProviderMetadata<T>> {
    const providers = await this.getList<T>(refreshCache);

    const provider = providers.find(({ uid }) => uid === id);

    this.logger.trace({ provider });

    return provider;
  }

  private legacyToOpenIdPropertyName(
    source: IdentityProvider,
  ): IdentityProviderMetadata {
    const mapping = {
      clientID: 'client_id',
      tokenURL: 'token_endpoint',
      authzURL: 'authorization_endpoint',
      userInfoURL: 'userinfo_endpoint',
      jwksURL: 'jwks_uri',
      url: 'issuer',
      endSessionURL: 'end_session_endpoint',
    };

    const result = { ...source };

    Object.entries(mapping).forEach(([legacyName, oidcName]) => {
      result[oidcName] = source[legacyName];
      Reflect.deleteProperty(result, legacyName);
    });
    // openid defined property names
    // eslint-disable-next-line @typescript-eslint/naming-convention
    result.client_secret = this.decryptClientSecret(source.client_secret);

    /**
     * @TODO #326 Fix type issues between legacy model and `oidc-client` library
     * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/merge_requests/326
     * We have non blocking incompatilities.
     */
    return result as unknown as IdentityProviderMetadata;
  }

  /**
   * Decrypt client secrect with specific key provided by configuration
   *
   * @param clientSecret
   */
  private decryptClientSecret(clientSecret: string): string {
    const { clientSecretEcKey } =
      this.config.get<IdentityProviderAdapterMongoConfig>(
        'IdentityProviderAdapterMongoConfig',
      );
    return this.crypto.decrypt(
      clientSecretEcKey,
      Buffer.from(clientSecret, 'base64'),
    );
  }
}
