import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { cloneDeep } from "lodash";
import { Model } from "mongoose";

import { Injectable, Type } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { ConfigService } from "@fc/config";
import { CryptographyService } from "@fc/cryptography";
import { LoggerService } from "@fc/logger";
import { MongooseCollectionOperationWatcherHelper } from "@fc/mongoose";
import {
  FederationClientMetadata,
  FederationServerMetadata,
  IdentityProviderMetadata,
} from "@fc/oidc";
import { IdentityProviderAdapter } from "@fc/oidc-client";

import { ClientMetadata, ServerMetadata } from "openid-client";
import {
  DiscoveryIdpAdapterMongoDTO,
  IdentityProviderAdapterMongoConfig,
  NoDiscoveryIdpAdapterMongoDTO,
} from "./dto";
import { IdentityProvider } from "./schemas";

export const CLIENT_METADATA = [
  "client_id",
  "client_secret",
  "response_types",
  "id_token_signed_response_alg",
  "token_endpoint_auth_method",
  "revocation_endpoint_auth_method",
  "id_token_encrypted_response_alg",
  "id_token_encrypted_response_enc",
  "userinfo_encrypted_response_alg",
  "userinfo_encrypted_response_enc",
  "userinfo_signed_response_alg",
] as const satisfies (keyof ClientMetadata)[];

export const IDP_METADATA = [
  "issuer",
  "token_endpoint",
  "authorization_endpoint",
  "jwks_uri",
  "userinfo_endpoint",
  "end_session_endpoint",
] as const satisfies readonly (keyof ServerMetadata)[];

@Injectable()
export class IdentityProviderAdapterMongoService implements IdentityProviderAdapter {
  private listCache: IdentityProviderMetadata[];

  constructor(
    @InjectModel("IdentityProvider")
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
    this.logger.debug("Initializing identity-provider");

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

    const identityProviders = [];

    for (const rawIdentityProvider of rawIdentityProviders) {
      const dto = this.getIdentityProviderDTO(rawIdentityProvider?.discovery);
      const identityProvider = plainToInstance(dto, rawIdentityProvider);
      const errors = await validate(identityProvider, {
        whitelist: true,
      });

      if (errors.length > 0) {
        this.logger.error({
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
      const allIdentityProviders = await this.findAllIdentityProvider();
      this.listCache = allIdentityProviders.map((idp) =>
        this.legacyToOpenIdPropertyName(idp),
      );
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

  getFqdnFromEmail(email: string | undefined): string | undefined {
    return email?.split("@").pop().toLowerCase();
  }

  getIdpsByEmail(email: string): Promise<IdentityProviderMetadata[]> {
    const fqdn = this.getFqdnFromEmail(email);
    return this.getIdpsByFqdn(fqdn);
  }

  async getIdpsByFqdn(fqdn: string): Promise<IdentityProviderMetadata[]> {
    const allIdentityProviders = await this.getList();
    const filteredIdps = allIdentityProviders.filter((idp) =>
      idp.fqdns?.includes(fqdn),
    );

    return filteredIdps;
  }

  // The legacy format is not a ProConnect concept.
  // We should probably avoid transforming the IDP and use the database format directly
  private legacyToOpenIdPropertyName(
    source: IdentityProvider,
  ): IdentityProviderMetadata {
    const mapping = {
      // Oidc provider properties
      authzURL: "authorization_endpoint",
      clientID: "client_id",
      endSessionURL: "end_session_endpoint",
      jwksURL: "jwks_uri",
      tokenURL: "token_endpoint",
      url: "issuer",
      userInfoURL: "userinfo_endpoint",
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
    result.response_types = ["code"];
    result.revocation_endpoint_auth_method = "client_secret_post";

    return this.toPanvaFormat(result);
  }

  // The Panva format does not refer to a format provided by openid-client that we are aware of.
  // We should probably avoid transforming the IDP and use the database format directly
  private toPanvaFormat(result: unknown): IdentityProviderMetadata {
    const panvaFormatted = {
      federationClientMetadata: {} as FederationClientMetadata,
      federationServerMetadata: {} as FederationServerMetadata,
    };

    Object.entries(result).forEach(([key, value]) => {
      if (CLIENT_METADATA.includes(key as (typeof CLIENT_METADATA)[number])) {
        panvaFormatted.federationClientMetadata[key] = value;
      } else if (IDP_METADATA.includes(key as (typeof IDP_METADATA)[number])) {
        panvaFormatted.federationServerMetadata[key] = value;
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
        "IdentityProviderAdapterMongo",
      );

    if (!decryptClientSecretFeature) {
      return null;
    }

    return this.crypto.decrypt(
      clientSecretEncryptKey,
      Buffer.from(clientSecret, "base64"),
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
