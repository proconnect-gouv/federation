import { Injectable } from '@nestjs/common';
import { OverrideCode } from '@fc/common';
import { LoggerService } from '@fc/logger';

@Injectable()
export class JoseOverrideService {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(this.constructor.name);
  }

  /**
   * Override external code
   * Function must have been wrapped before other libraries loads them.
   *
   * Note that this code runs at init time only
   *
   * @see ../overrides
   * @see your main.ts file
   */
  onModuleInit() {
    this.registerOverride('derToJose');
    this.registerOverride('encodeBuffer');
    this.registerOverride('JWS.compact');
  }

  /**
   * Helper to avoid boring repetitive binding in onModuleInit
   * Register method <overrideName> as an override to wrapped code named <overrideName>
   * and bind `this` reference.
   *
   * @param overrideName Name of the override to bind to a local method
   */
  private registerOverride(overrideName: string): void {
    OverrideCode.override(overrideName, this[overrideName].bind(this));
  }

  /**
   * Make function able to wait for promise resolution
   * `derToJose` expects a string, but our override on `sign` returns a Promise
   * @see https://github.com/panva/jose/blob/master/lib/help/ecdsa_signatures.js#L32
   */
  private derToJose(signature, alg) {
    this.logger.debug('Run override for derToJose');
    const original = OverrideCode.getOriginal('derToJose');

    if (signature instanceof Promise) {
      return new Promise(async (resolve, reject) => {
        try {
          resolve(original(await signature, alg));
        } catch (error) {
          reject(error);
        }
      });
    }

    return original(signature, alg);
  }

  /**
   * Make function able to wait for promise resolution
   * `encodeBuffer` expects a string, but our override on `sign` returns a Promise
   * @see https://github.com/panva/jose/blob/master/lib/help/base64url.js#L11
   */
  private encodeBuffer(buffer) {
    this.logger.debug('Run override for encodeBuffer');
    const original = OverrideCode.getOriginal('encodeBuffer');

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

  /**
   * Make function able to wait for promise resolution
   * `JWS.serialiser.compact` expects a string, but our override on `sign` returns a Promise
   * @see https://github.com/panva/jose/blob/master/lib/jws/serializers.js#L7
   */
  private ['JWS.compact'](payload, [recipient]) {
    this.logger.debug('Run override for JWS.compact');
    const original = OverrideCode.getOriginal('JWS.compact');

    if (recipient.signature instanceof Promise) {
      return new Promise(async (resolve, reject) => {
        try {
          const signature = await recipient.signature;
          resolve(original(payload, [{ ...recipient, signature }]));
        } catch (error) {
          reject(error);
        }
      });
    }

    return original(payload, [recipient]);
  }
}
