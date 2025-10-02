import { ConfigService, InjectConfig } from 'nestjs-config';
import { Injectable } from '@nestjs/common';
import {
  createDecipheriv,
  randomBytes,
  createCipheriv,
  createHash,
} from 'crypto';

const NONCE_LENGTH = 12;
const AUTHTAG_LENGTH = 16;
const CIPHER_HEAD_LENGTH = NONCE_LENGTH + AUTHTAG_LENGTH;

@Injectable()
export class SecretManagerService {
  constructor(@InjectConfig() private readonly config: ConfigService) {}

  encrypt(data: string): string {
    const nonce = randomBytes(NONCE_LENGTH);

    const cipher = createCipheriv(
      'aes-256-gcm',
      this.config.get('app').cipherPass,
      nonce,
      {
        authTagLength: AUTHTAG_LENGTH,
      },
    );

    const ciphertext = cipher.update(data, 'utf8');
    cipher.final();
    const tag = cipher.getAuthTag();

    return Buffer.concat([nonce, tag, ciphertext]).toString('base64');
  }

  /**
   * Current implementation use symetrical AES-256-GCM.
   * @see https://crypto.stackexchange.com/a/18092
   */
  decrypt(cipher: string): any {
    const cipherBuffer = Buffer.from(cipher, 'base64');

    if (Buffer.byteLength(cipherBuffer) <= CIPHER_HEAD_LENGTH) {
      throw new Error('Authentication failed !');
    }

    const nonce = cipherBuffer.slice(0, 12);
    const tag = cipherBuffer.slice(12, 28);
    const ciphertext = cipherBuffer.slice(28);

    const decipher = createDecipheriv(
      'aes-256-gcm',
      this.config.get('app').cipherPass,
      nonce,
      {
        authTagLength: AUTHTAG_LENGTH,
      },
    );

    decipher.setAuthTag(tag);

    const receivedPlaintext = decipher.update(ciphertext, null, 'utf8');

    try {
      decipher.final();
    } catch (err) {
      throw new Error('Authentication failed !');
    }

    return receivedPlaintext;
  }

  public generateSHA256(): string {
    const lengthValue = 256;
    const hashFunction = 'sha256';
    const digestType = 'hex';
    const length = lengthValue;
    const random = randomBytes(length);

    return createHash(hashFunction).update(random).digest(digestType);
  }
}
