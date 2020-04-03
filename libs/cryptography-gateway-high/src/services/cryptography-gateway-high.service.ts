import { Injectable } from '@nestjs/common';
import { LoggerService } from '@fc/logger';
/** @TODO remove this import once we get ride of temp implementations */
import { OverrideCode } from '@fc/common';

@Injectable()
export class CryptographyGatewayHighService {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(this.constructor.name);
  }

  /**
   * Sign data using crypto and a private key
   * @param privateKey the private key PEM formatted
   * @param data a serialized data
   * @param digest default to sha256 (Cf. crypto.createSign)
   * @returns signed data
   * Temporary test implementation
   * @TODO implement real HSM gateway call
   */
  async sign(
    privateKey: string,
    data: Buffer,
    digest = 'sha256',
  ): Promise<Buffer> {
    this.logger.debug('Signing from gateway');
    const original = OverrideCode.getOriginal('crypto.sign');

    return new Promise(resolve => {
      setTimeout(() => {
        this.logger.debug('Resolving async signing from gateway');
        resolve(original(digest, data, privateKey));
      }, 200);
    });
  }

  /**
   * Decrypt data using crypto and a private key
   * @param privateKey the private key PEM formatted
   * @param cipher a cipher
   * @returns decrypted data
   * Temporary test implementation
   * @TODO implement real HSM gateway call
   */
  async privateDecrypt(privateKey: string, cipher: Buffer): Promise<Buffer> {
    this.logger.debug('private decrypting from gateway');
    const original = OverrideCode.getOriginal('crypto.privateDecrypt');

    return new Promise(resolve => {
      setTimeout(() => {
        this.logger.debug('Resolving async decrypting from gateway');
        resolve(original(privateKey, cipher));
      }, 100);
    });
  }
}
