import {
  randomBytes,
  createCipheriv,
  createDecipheriv,
  createHmac,
} from 'crypto';
import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { timeout } from 'rxjs/operators';
import { LoggerService } from '@fc/logger';
import { ConfigService } from '@fc/config';
import { RabbitmqConfig } from '@fc/rabbitmq';
import { CryptoProtocol } from '@fc/microservices';
import { IPivotIdentity } from '../interfaces';
import { CryptographyGatewayException } from '../exceptions';
import { CryptographyConfig } from '../dto';

const NONCE_LENGTH = 12;
const AUTHTAG_LENGTH = 16;
const CIPHER_HEAD_LENGTH = NONCE_LENGTH + AUTHTAG_LENGTH;

@Injectable()
export class CryptographyService {
  constructor(
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
    @Inject('CryptographyBroker') private broker: ClientProxy,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  onModuleInit() {
    this.broker.connect();
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
  encryptUserInfosCache(key: string, data: string): Buffer {
    return this.encrypt(key, data);
  }

  /**
   * Decrypt the given UserInfos retrieved from cache for oidc-provider.
   * Current implementation use symetrical AES-256-GCM.
   *
   * @see https://crypto.stackexchange.com/a/18092
   * @param key the key to encrypt the data
   * @param cipher the cipher to decrypt
   * @returns the data decrypted
   */
  decryptUserInfosCache(key: string, cipher: Buffer): any {
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

  /**
   * Sign data using crypto and a private key
   * @param _unusedKey the private key provided by oidc-provider
   * we do not use it since signature will occur with an HSM stored key.
   * @param data a serialized data
   * @param digest default to sha256 (Cf. crypto.createSign)
   * @returns signed data
   */
  async sign(
    _unusedKey: any,
    dataBuffer: Buffer,
    digest = 'sha256',
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const { payloadEncoding, requestTimeout } = this.config.get<
        RabbitmqConfig
      >('CryptographyBroker');

      this.logger.debug('Requesting signature from gateway');
      try {
        // Build message
        const payload = {
          data: dataBuffer.toString(payloadEncoding),
          digest,
        };

        // Build callbacks
        const success = this.signSuccess.bind(this, resolve, reject);
        const failure = this.signFailure.bind(this, reject);

        // Send message to gateway
        this.broker
          .send(CryptoProtocol.Commands.SIGN, payload)
          .pipe(timeout(requestTimeout))
          .subscribe(success, failure);
      } catch (error) {
        reject(new CryptographyGatewayException(error));
      }
    });
  }

  // Handle successful call
  private signSuccess(resolve, reject, data) {
    this.logger.debug('Received signature from gateway');
    const { payloadEncoding } = this.config.get<RabbitmqConfig>(
      'CryptographyBroker',
    );

    /**
     * @TODO define a more powerful mechanism
     */
    if (data === 'ERROR') {
      return this.signFailure(
        reject,
        new Error('Gateway completed with an error'),
      );
    }
    return resolve(Buffer.from(data, payloadEncoding));
  }

  // Handle microservice failure
  private signFailure(reject, error) {
    reject(new CryptographyGatewayException(error));
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
      /** @TODO throw a specific exception */
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
      /** @TODO throw a specific exception */
      throw new Error('Authentication failed !');
    }

    return receivedPlaintext;
  }
}
