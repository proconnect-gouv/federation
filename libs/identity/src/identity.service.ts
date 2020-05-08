import { Injectable, Inject } from '@nestjs/common';
import { IIdentityService } from '@fc/oidc-provider';
import { LoggerService } from '@fc/logger';
import { Redis, REDIS_CONNECTION_TOKEN } from '@fc/redis';
import { CryptographyService } from '@fc/cryptography';
import { ConfigService } from '@fc/config';
import { IdentityConfig } from './dto';
import {
  IdentityBadFormatException,
  IdentityNotFoundException,
} from './exceptions';
import { IIdentity } from './interfaces';

export const IDP_IDENTITY_PREFIX = 'IDP-ID:';
export const SP_IDENTITY_PREFIX = 'SP-ID:';

@Injectable()
export class IdentityService implements IIdentityService {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    @Inject(REDIS_CONNECTION_TOKEN) private readonly redis: Redis,
    private readonly cryptography: CryptographyService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  /**
   * Syntax sugar to get cryptographic key from config
   *
   * @returns cryptographyKey entry from config.
   */
  private get cryptoKey(): string {
    const { cryptographyKey } = this.config.get<IdentityConfig>('Identity');

    return cryptographyKey;
  }

  /**
   * Transform data to encrypted string, easy to persist.
   *
   * @param data data to serialize
   * @returns encrypted string representation of <data>
   */
  private serialize(data: object): string {
    const dataString = JSON.stringify(data);
    const dataCipher = this.cryptography
      .encryptUserInfosCache(this.cryptoKey, dataString)
      .toString('base64');

    return dataCipher;
  }

  /**
   * Build back an object from encrypted string representation.
   *
   * @param data encrypted string representation of a data object
   * eg output of `serialize` method.
   * @returns object data
   */
  private unserialize(data: string): any {
    const dataBuffer = Buffer.from(data, 'base64');
    const dataString = this.cryptography.decryptUserInfosCache(
      this.cryptoKey,
      dataBuffer,
    );

    try {
      return JSON.parse(dataString);
    } catch (error) {
      throw new IdentityBadFormatException(error);
    }
  }

  /**
   * Get identity from volatile memory
   *
   * @TODO interface/DTO for identity
   * @TODO handle return or throw if persistance fails
   */
  private async getIdentity(
    key: string,
  ): Promise<{ identity: IIdentity; meta: any }> {
    this.logger.debug('get identity from redis');
    const dataCipher = await this.redis.get(key);

    if (!dataCipher) {
      throw new IdentityNotFoundException();
    }

    return this.unserialize(dataCipher);
  }

  /**
   * Store identity in volatile memory for later retrieval
   * when SP calls us on /userinfo
   *
   * @TODO interface/DTO for identity
   * @TODO handle return or throw if persistance fails
   */
  private async storeIdentity(
    key: string,
    identity: IIdentity,
    meta: any,
  ): Promise<boolean> {
    this.logger.debug('store identity in redis');
    const data = this.serialize({ identity, meta });
    const status = await this.redis.set(key, data);

    return Boolean(status);
  }

  /**
   * Remove an identity from volatile memory
   * @param key
   */
  private async deleteIdentity(key: string): Promise<number> {
    this.logger.debug('delete identity in redis');

    return this.redis.del(key);
  }

  /**
   * Shortcut methods with prefixs for IdP
   */
  storeIdpIdentity(
    key: string,
    identity: IIdentity,
    meta: any,
  ): Promise<boolean> {
    return this.storeIdentity(`${IDP_IDENTITY_PREFIX}${key}`, identity, meta);
  }

  getIdpIdentity(key: string): Promise<{ identity: IIdentity; meta: any }> {
    return this.getIdentity(`${IDP_IDENTITY_PREFIX}${key}`);
  }

  deleteIdpIdentity(key: string): Promise<number> {
    return this.deleteIdentity(`${IDP_IDENTITY_PREFIX}${key}`);
  }

  /**
   * Shortcut methods with prefixs for SP
   */
  storeSpIdentity(
    key: string,
    identity: IIdentity,
    meta: any,
  ): Promise<boolean> {
    return this.storeIdentity(`${SP_IDENTITY_PREFIX}${key}`, identity, meta);
  }

  getSpIdentity(key: string): Promise<{ identity: IIdentity; meta: any }> {
    return this.getIdentity(`${SP_IDENTITY_PREFIX}${key}`);
  }

  deleteSpIdentity(key: string): Promise<number> {
    return this.deleteIdentity(`${SP_IDENTITY_PREFIX}${key}`);
  }
}
