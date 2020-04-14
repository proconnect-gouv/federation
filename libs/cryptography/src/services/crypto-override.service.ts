import { Injectable } from '@nestjs/common';
import { OverrideCode } from '@fc/common';
import { LoggerService } from '@fc/logger';
import { CryptographyService } from './cryptography.service';

@Injectable()
export class CryptoOverrideService {
  constructor(
    private readonly cryptographyService: CryptographyService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  onModuleInit() {
    /**
     * Override dependecies
     * Function has to be wrapped at init time,
     * @see ../overrides
     * @see your main.ts file
     */
    this.registerOverride('crypto.sign');
    this.registerOverride('crypto.privateDecrypt');
    this.registerOverride('crypto.createSecretKey');
  }

  private registerOverride(name) {
    OverrideCode.override(name, this[name].bind(this));
  }

  /**
   * Use our own sign library
   */
  private ['crypto.sign'](nodeAlg: string, payload, key) {
    this.logger.debug('Run override for crypto.sign');
    /**
     * Return a wrapper compatible with usage mae by `JOSE`:
     * Jose inernally makes call to native crypto createSign
     * `createSign(nodeAlg).update(payload).sign(key)`
     *
     * Version at time this code is written
     * @see https://github.com/panva/jose/tree/v1.25.0/lib/jwa/ecdsa.js#L28
     *
     * Current version
     * @see https://github.com/panva/jose/blob/master/lib/jwa/ecdsa.js#L28
     */
    return this.cryptographyService.sign(key, payload, nodeAlg);
  }

  /**
   * Use our own privateDecrypt library
   */
  private async ['crypto.privateDecrypt'](privateKey, buffer) {
    this.logger.debug('Run override for crypto.privateDecrypt');

    return this.cryptographyService.privateDecrypt(privateKey, buffer);
  }

  /**
   * Return promise only if buffer is a promise
   */
  private ['crypto.createSecretKey'](buffer) {
    this.logger.debug('Run override for crypto.createSecretKey');
    const original = OverrideCode.getOriginal('crypto.createSecretKey');

    if (buffer instanceof Promise) {
      return new Promise(async (resolve, reject) => {
        try {
          resolve(original(await buffer));
        } catch (error) {
          reject(error);
        }
      });
    }

    return original(buffer);
  }
}
