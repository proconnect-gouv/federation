import { randomBytes, createCipheriv, createDecipheriv, createHash, createHmac } from 'crypto';
import { derToJose } from 'jose/lib/help/ecdsa_signatures';
import { Injectable, Inject } from '@nestjs/common';
import { IPivotIdentity } from './interfaces';
import { GATEWAY } from './tokens';
import { IGateway } from './interfaces';


const NONCE_LENGTH = 12;
const AUTHTAG_LENGTH = 16;
const CIPHER_HEAD_LENGTH = NONCE_LENGTH + AUTHTAG_LENGTH;

@Injectable()
export class CryptographyService {
  constructor(@Inject(GATEWAY) private readonly gateway: IGateway) {}
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
   * Decrypt the given cipher
   * Current implementation use asymetrical RSA-PKCS-OAEP
   * @todo Need implementation
   * @param privateKey RSA-PKCS-OAEP PEM formatted
   * @param cipher the cipher to decrypt
   * @returns the jwt decrypted
   */
  async decryptJwt(privateKey: string, cipher: Buffer): Promise<Buffer> {
    // Linter killer
    cipher as unknown;
    privateKey as unknown;

    return Buffer.from('jwt', 'utf8');
  }

  /**
   * Sign a jwt, given an identity hash and a client id
   * Current implementation use asymetrical ECDSA-Prime256v1,
   * @see https://github.com/panva/jose/blob/master/lib/help/ecdsa_signatures.js
   * @param privateKey ECDSA-Prime256v1 PEM formatted
   * @param jwt a jwt formatted "<HEADER>.<PAYLOAD>"
   * @returns the jwt formatted "<HEADER>.<PAYLOAD>.<SIGNATURE>"
   */
  async signJwt(privateKey: string, jwt: string): Promise<string> {
    const derSignature = await this.gateway.sign(
      privateKey,
      Buffer.from(jwt, 'utf8'),
    );
    const jws = derToJose(derSignature, 'ES256').toString('utf8');

    return `${jwt}.${jws}`;
  }
}
