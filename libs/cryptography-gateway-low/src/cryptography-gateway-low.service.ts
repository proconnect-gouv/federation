import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CryptographyGatewayLowService {
  /**
   * Sign data using crypto and a private key
   * @param privateKey the private key PEM formatted
   * @param data a serialized data
   * @param digest default to sha256 (Cf. crypto.createSign)
   * @returns signed data
   */
  async sign(privateKey: string, data: Buffer, digest = 'sha256'): Promise<Buffer> {
    const signer = crypto.createSign(digest);

    signer.write(data);
    signer.end();

    const signature: Buffer = signer.sign(privateKey);

    return signature;
  }

  /**
   * Decrypt data using crypto and a private key
   * @param privateKey the private key PEM formatted
   * @param cipher a cipher
   * @returns decrypted data
   */
  async privateDecrypt(privateKey: string, cipher: Buffer): Promise<Buffer> {
    return crypto.privateDecrypt(privateKey, cipher);
  }
}
