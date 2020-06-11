import {
  randomBytes,
  createCipheriv,
  createDecipheriv,
  createHmac,
} from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@fc/config';
import { IPivotIdentity } from './interfaces';
import { CryptographyConfig } from './dto';

const NONCE_LENGTH = 12;
const AUTHTAG_LENGTH = 16;
const CIPHER_HEAD_LENGTH = NONCE_LENGTH + AUTHTAG_LENGTH;

@Injectable()
export class CryptographyService {
  constructor(private readonly config: ConfigService) {}

  /**
   * Encrypt the given data
   * Current implementation use symetrical AES-256-GCM.
   * @see https://crypto.stackexchange.com/a/18092
   * @param key the key to encrypt the data
   * @param data the data to encrypt
   * @returns the cipher as a base64 encoded string
   */
  encryptSymetric(key: string, data: string): string {
    const buffer = this.encrypt(key, data);

    return buffer.toString('base64');
  }

  /**
   * Decrypt the given cipher
   * Current implementation use symetrical AES-256-GCM.
   *
   * @see https://crypto.stackexchange.com/a/18092
   * @param key the key to encrypt the data
   * @param cipher the cipher to decrypt
   * @returns the data decrypted
   */
  decryptSymetric(key: string, data: string): string {
    const cipher = Buffer.from(data, 'base64');
    return this.decrypt(key, cipher);
  }

  /**
   * Decrypt client secrect with specific key provided by configuration
   *
   * @param clientSecret
   */
  decryptClientSecret(clientSecret: string): string {
    const { clientSecretEcKey } = this.config.get<CryptographyConfig>(
      'Cryptography',
    );
    return this.decrypt(clientSecretEcKey, Buffer.from(clientSecret, 'base64'));
  }

  /**
   * Compute the identity hmac
   * Current implementation uses sha256
   * @param pivotIdentity
   * @returns the identity hmac "hex" digested
   */
  computeIdentityHash(pivotIdentity: IPivotIdentity): string {
    const { identityHashSalt } = this.config.get<CryptographyConfig>(
      'Cryptography',
    );

    const hash = createHmac('sha256', identityHashSalt);

    const serial =
      pivotIdentity.given_name +
      pivotIdentity.family_name +
      pivotIdentity.birthdate +
      pivotIdentity.gender +
      pivotIdentity.birthplace +
      pivotIdentity.birthcountry;

    hash.update(serial);

    return hash.digest('hex');
  }

  /**
   * Compute the sub V2, given an identity hash and a client id
   * Current implementation uses HMAC sha256
   * @param identityHash the identity hash computed by calling "computeIdentityHash"
   * @param clientId used to create the HMAC
   * @returns the sub "hex" digested and suffixed with "v2"
   */
  computeSubV2(identityHash: string, clientId: string): string {
    const hmac = createHmac('sha256', clientId);

    hmac.update(identityHash);

    return `${hmac.digest('hex')}v2`;
  }

  genSessionId() {
    const { sessionIdLength } = this.config.get<CryptographyConfig>(
      'Cryptography',
    );

    return randomBytes(sessionIdLength).toString('base64');
  }

  /**
   * Encrypt the given string.
   * Current implementation use symetrical AES-256-GCM.
   * @see https://crypto.stackexchange.com/a/18092
   * @param key the key to encrypt the data
   * @param data the data to encrypt
   * @returns the cipher
   */
  private encrypt(key: string, data: string): Buffer {
    const nonce = randomBytes(NONCE_LENGTH);

    const cipher = createCipheriv('aes-256-gcm', key, nonce, {
      authTagLength: AUTHTAG_LENGTH,
    });

    const ciphertext = cipher.update(data, 'utf8');
    cipher.final();
    const tag = cipher.getAuthTag();

    return Buffer.concat([nonce, tag, ciphertext]);
  }

  /**
   * Decrypt the given cipher.
   * Current implementation use symetrical AES-256-GCM.
   * @see https://crypto.stackexchange.com/a/18092
   * @param key the key to encrypt the data
   * @param cipher the cipher to decrypt
   * @returns the data decrypted
   */
  private decrypt(key: string, cipher: Buffer): any {
    if (Buffer.byteLength(cipher) <= CIPHER_HEAD_LENGTH) {
      /**
       * @TODO #138 throw a specific exception
       * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/138
       */
      throw new Error('Authentication failed !');
    }

    const nonce = cipher.slice(0, 12);
    const tag = cipher.slice(12, 28);
    const ciphertext = cipher.slice(28);

    const decipher = createDecipheriv('aes-256-gcm', key, nonce, {
      authTagLength: AUTHTAG_LENGTH,
    });

    decipher.setAuthTag(tag);

    const receivedPlaintext = decipher.update(ciphertext, null, 'utf8');

    try {
      decipher.final();
    } catch (err) {
      /**
       * @TODO #138 throw a specific exception
       * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/138
       */
      throw new Error('Authentication failed !');
    }

    return receivedPlaintext;
  }
}
