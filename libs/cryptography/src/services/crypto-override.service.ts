import { Injectable } from '@nestjs/common';
import { OverrideCode } from '@fc/common';
import { LoggerService } from '@fc/logger';
import { CryptographyService } from './cryptography.service';

@Injectable()
export class CryptoOverrideService {
  constructor(
    private readonly cryptography: CryptographyService,
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
    return this.cryptography.sign(key, payload, nodeAlg);
  }
}
