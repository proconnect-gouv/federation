import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import * as deepFreeze from 'deep-freeze';
import { cloneDeep } from 'lodash';
import { Model } from 'mongoose';

import { Injectable, Type } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { ConfigService } from '@fc/config';
import { CryptographyService } from '@fc/cryptography';
import { LoggerService } from '@fc/logger';
import { MongooseCollectionOperationWatcherHelper } from '@fc/mongoose';
import {
  ClientMetadata,
  IdentityProviderMetadata,
  IssuerMetadata,
} from '@fc/oidc';
import { IIdentityProviderAdapter } from '@fc/oidc-client';

import {
  DiscoveryIdpAdapterMongoDTO,
  IdentityProviderAdapterMongoConfig,
  NoDiscoveryIdpAdapterMongoDTO,
} from './dto';
import { IdentityProvider } from './schemas';

const CLIENT_METADATA = [
  'client_id',
  'client_secret',
  'response_types',
  'id_token_signed_response_alg',
  'token_endpoint_auth_method',
  'revocation_endpoint_auth_method',
  'id_token_encrypted_response_alg',
  'id_token_encrypted_response_enc',
  'userinfo_encrypted_response_alg',
  'userinfo_encrypted_response_enc',
  'userinfo_signed_response_alg',
];

const ISSUER_METADATA = [
  'issuer',
  'token_endpoint',
  'authorization_endpoint',
  'jwks_uri',
  'userinfo_endpoint',
  'end_session_endpoint',
];
@Injectable()
export class IdentityProviderAdapterMongoService
  implements IIdentityProviderAdapter
{
  private listCache: IdentityProviderMetadata[];

  // Dependency injection can require more than 4 parameters
  /* eslint-disable-next-line max-params */
  constructor(
    @InjectModel('IdentityProvider')
    private readonly identityProviderModel: Model<IdentityProvider>,
    private readonly crypto: CryptographyService,
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly mongooseWatcher: MongooseCollectionOperationWatcherHelper,
  ) {}

  async onModuleInit() {
    this.mongooseWatcher.watchWith<IdentityProvider>(
      this.identityProviderModel,
      this.refreshCache.bind(this),
    );
    this.logger.debug('Initializing identity-provider');

    // Warm up cache and shows up excluded IdPs
    await this.getList();
  }

  async refreshCache(): Promise<void> {
    await this.getList(true);
  }

  private async findAllIdentityProvider() {
    const rawIdentityProviders = await this.identityProviderModel
      .find({})
      .lean();

    const { disableIdpValidationOnLegacy } =
      this.config.get<IdentityProviderAdapterMongoConfig>(
        'IdentityProviderAdapterMongo',
      );

    const identityProviders = [];

    for (const rawIdentityProvider of rawIdentityProviders) {
      if (disableIdpValidationOnLegacy) {
        this.logger.warning(
          `"${rawIdentityProvider?.uid}": Skipping DTO validation due to legacy IdP mode.`,
        );
        identityProviders.push(rawIdentityProvider);
        continue;
      }

      const dto = this.getIdentityProviderDTO(rawIdentityProvider?.discovery);
      const identityProvider = plainToInstance(dto, rawIdentityProvider);
      const errors = await validate(identityProvider, {
        whitelist: true,
      });

      if (errors.length > 0) {
        this.logger.alert({
          msg: `Identity provider "${rawIdentityProvider?.name}" (${rawIdentityProvider?.uid}) was excluded at DTO validation`,
          validationErrors: errors,
        });
      } else {
        identityProviders.push(identityProvider);
      }
    }

    return identityProviders;
  }

  /**
   * Get the list of IdentityProviderMetadata, optionally refreshing the cache.
   *
   * @param {boolean} [refreshCache=false] - Whether to refresh the cache made by the service
   */
  async getList(refreshCache?: boolean): Promise<IdentityProviderMetadata[]> {
    if (refreshCache || !this.listCache) {
      this.logger.debug('Refresh cache from DB');
      const list = await this.findAllIdentityProvider();
      this.listCache = deepFreeze(
        list.map(this.legacyToOpenIdPropertyName.bind(this)),
      ) as IdentityProviderMetadata[];
    }

    return this.listCache;
  }

  async getById(
    id: string,
    refreshCache = false,
  ): Promise<IdentityProviderMetadata> {
    const providers = cloneDeep(await this.getList(refreshCache));

    const provider = providers.find(({ uid }) => uid === id);

    return provider;
  }

  async isActiveById(id: string): Promise<boolean> {
    const idp = await this.getById(id);

    return Boolean(idp?.active);
  }

  getIdpsByEmail(email: string): Promise<IdentityProviderMetadata[]> {
    const fqdn = email.split('@').pop().toLowerCase();
    return this.getIdpsByFqdn(fqdn);
  }

  async getIdpsByFqdn(fqdn: string): Promise<IdentityProviderMetadata[]> {
    const allIdentityProviders = await this.getList();
    const filteredIdps = allIdentityProviders.filter((idp) =>
      idp.fqdns?.includes(fqdn),
    );

    return filteredIdps;
  }

  // todo: remove this method for proconnect, we have no legacy IdP
  private legacyToOpenIdPropertyName(
    source: IdentityProvider,
  ): IdentityProviderMetadata {
    const mapping = {
      // Oidc provider properties
      authzURL: 'authorization_endpoint',
      clientID: 'client_id',
      endSessionURL: 'end_session_endpoint',
      jwksURL: 'jwks_uri',
      tokenURL: 'token_endpoint',
      url: 'issuer',
      userInfoURL: 'userinfo_endpoint',
    };

    const result: Partial<IdentityProvider & IdentityProviderMetadata> = {
      ...source,
    };

    Object.entries(mapping).forEach(([legacyName, oidcName]) => {
      result[oidcName] = source[legacyName];
      Reflect.deleteProperty(result, legacyName);
    });

    result.client_secret = this.decryptClientSecret(source.client_secret);

    // default values
    result.response_types = ['code'];
    result.revocation_endpoint_auth_method = 'client_secret_post';

    /**
     * @TODO #326 Fix type issues between legacy model and `oidc-client` library
     * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/merge_requests/326
     * We have non-blocking incompatibilities.
     */
    return this.toPanvaFormat(result);
  }

  // todo: check if we can simply save the idp as panva format
  private toPanvaFormat(result: unknown): IdentityProviderMetadata {
    const panvaFormatted = {
      client: {} as ClientMetadata,
      issuer: {} as IssuerMetadata,
    };

    Object.entries(result).forEach(([key, value]) => {
      if (CLIENT_METADATA.includes(key)) {
        panvaFormatted.client[key] = value;
      } else if (ISSUER_METADATA.includes(key)) {
        panvaFormatted.issuer[key] = value;
      } else {
        panvaFormatted[key] = value;
      }
    });

    return panvaFormatted as IdentityProviderMetadata;
  }

  /**
   * Decrypt client secret with specific key provided by configuration
   *
   * @param clientSecret
   */
  private decryptClientSecret(clientSecret: string): string {
    const { clientSecretEncryptKey, decryptClientSecretFeature } =
      this.config.get<IdentityProviderAdapterMongoConfig>(
        'IdentityProviderAdapterMongo',
      );

    if (!decryptClientSecretFeature) {
      return null;
    }

    return this.crypto.decrypt(
      clientSecretEncryptKey,
      Buffer.from(clientSecret, 'base64'),
    );
  }

  private getIdentityProviderDTO(
    discovery: boolean,
  ): Type<DiscoveryIdpAdapterMongoDTO | NoDiscoveryIdpAdapterMongoDTO> {
    return discovery
      ? DiscoveryIdpAdapterMongoDTO
      : NoDiscoveryIdpAdapterMongoDTO;
  }
}
