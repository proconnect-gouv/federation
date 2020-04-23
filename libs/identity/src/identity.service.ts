import { Injectable } from '@nestjs/common';
import { IIdentityService } from '@fc/oidc-provider';
import { LoggerService } from '@fc/logger';
import { RedisService } from '@fc/redis';
import { CryptographyService } from '@fc/cryptography';
import { ConfigService } from '@fc/config';
import { IdentityConfig } from './dto';
import {
  IdentityBadFormatException,
  IdentityNotFoundException,
} from './exceptions';

@Injectable()
export class IdentityService implements IIdentityService {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly redisService: RedisService,
    private readonly cryptographyService: CryptographyService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  /**
   * Syntax sugar to get cryptographic key from config
   *
   * @returns cryptographyKey entry from config.
   */
  private get cryptoKey(): string {
    const { cryptographyKey } = this.configService.get<
      IdentityConfig
    >('Identity');

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
    const dataCipher = this.cryptographyService
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
  private unserialize(data: string): object {
    const dataBuffer = Buffer.from(data, 'base64');
    const dataString = this.cryptographyService.decryptUserInfosCache(
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
  async getIdentity(key: string): Promise<object> {
    this.logger.debug('get identity from redis');
    const dataCipher = await this.redisService.get(key);

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
  async storeIdentity(key: string, identity: object): Promise<boolean> {
    this.logger.debug('store identity in redis');
    const data = this.serialize(identity);

    return this.redisService.set(key, data);
  }
}
