import {
  randomBytes,
  createCipheriv,
  createDecipher,
  createDecipheriv,
  createHash,
  createHmac,
} from 'crypto';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@fc/logger';
/** @TODO remove this import once we get ride of temp implementations */
import { OverrideCode } from '@fc/common';
import { IPivotIdentity } from '../interfaces';

const NONCE_LENGTH = 12;
const AUTHTAG_LENGTH = 16;
const CIPHER_HEAD_LENGTH = NONCE_LENGTH + AUTHTAG_LENGTH;

@Injectable()
export class CryptographyService {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(this.constructor.name);
  }

  /**
   * Encrypt the given UserInfos obtained when oidc-provider want to cache it.
   * Current implementation use symetrical AES-256-GCM.
   * @todo create an interface with the data schema obtained from oidc-provider
   * @see https://crypto.stackexchange.com/a/18092
   * @param key the key to encrypt the data
   * @param data the data to encrypt
   * @returns the cipher
   */
  encryptUserInfosCache(key: string, data: any): Buffer {
    const nonce = randomBytes(NONCE_LENGTH);

    const cipher = createCipheriv('aes-256-gcm', key, nonce, {
      authTagLength: AUTHTAG_LENGTH,
    });

    /**
     * @TODO add a try/catch and re throw specific exception if data can't be "JSON.parsed"
     * @see https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/JSON/stringify
     * "TypeError" " BigInt value can't be serialized in JSON"  and "cyclic object value"
     */
    const plaintext = JSON.stringify(data);

    const ciphertext = cipher.update(plaintext, 'utf8');
    cipher.final();
    const tag = cipher.getAuthTag();

    return Buffer.concat([nonce, tag, ciphertext]);
  }

  /**
   * Decrypt the given UserInfos retrieved from cache for oidc-provider.
   * Current implementation use symetrical AES-256-GCM.
   * @todo create an interface with the data schema to transfer to oidc-provider
   * @see https://crypto.stackexchange.com/a/18092
   * @param key the key to encrypt the data
   * @param cipher the cipher to decrypt
   * @returns the data decrypted
   */
  decryptUserInfosCache(key: string, cipher: Buffer): any {
    if (Buffer.byteLength(cipher) <= CIPHER_HEAD_LENGTH) {
      /** @TODO throw a specific exception */
      throw new Error('Authentication failed !');
    }

    const nonce = cipher.slice(0, 12);
    const tag = cipher.slice(12, 28);
    const ciphertext = cipher.slice(28);

    const decipher = createDecipheriv('aes-256-gcm', key, nonce, {
      authTagLength: 16,
    });

    decipher.setAuthTag(tag);

    const receivedPlaintext = decipher.update(ciphertext, null, 'utf8');

    try {
      decipher.final();
    } catch (err) {
      /** @TODO throw a specific exception */
      throw new Error('Authentication failed !');
    }

    /** @TODO add try/catch block and re thow specific exception */
    return JSON.parse(receivedPlaintext);
  }

  // Simple alias
  // istanbul ignore next line
  decryptSecretHash(secretHash: string): string {
    return this.createDecipherLegacy(secretHash);
  }

  /**
   * @TODO refacto: replace createDecipher (deprecated) by createDecipheriv and make unit test
   * @see ticket: https://gitlab.dev-franceconnect.fr/france-connect/fc/issues/58
   * @param secretHash
   */
  // istanbul ignore next line
  private createDecipherLegacy(secretHash: string): string {
    const decipher = createDecipher(
      'aes-256-cbc',
      // environment variable which will be deleted on the function refacto
      process.env.CLIENT_SECRET_CIPHER_LEGACY,
    );

    let dec = decipher.update(secretHash, 'hex', 'utf8');
    dec += decipher.final('utf8');

    return JSON.parse(dec).password;
  }

  /**
   * Compute the identity hash
   * Current implementation uses sha256
   * @param pivotIdentity
   * @returns the identity hash "hex" digested
   */
  computeIdentityHash(pivotIdentity: IPivotIdentity): string {
    const hash = createHash('sha256');

    /** @TODO add try/catch block + specific exception */
    const serial = JSON.stringify(pivotIdentity);
    hash.update(serial);

    return hash.digest('hex');
  }

  /**
   * Compute the sub V2, given an identity hash and a client id
   * Current implementation uses HMAC sha256
   * @param identityHash the identity hash computed by calling "computeIdentityHash"
   * @param secret used to create the HMAC
   * @returns the sub "hex" digested and suffixed with "v2"
   */
  computeSubV2(identityHash: string, secret: string): string {
    const hmac = createHmac('sha256', secret);

    hmac.update(identityHash);

    return `${hmac.digest('hex')}v2`;
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
