import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { SignatureDigest } from './enums';

@Injectable()
export class CryptographyGatewayLowService {
  /**
   * Sign data using crypto and a private key
   * @param privateKey the private key PEM formatted
   * @param data data to sign as a Buffer
   * @param digest alg used to digest data before signing (default to sha256).
   * @returns signed data
   */
  async sign(
    privateKey: string,
    data: Buffer,
    digest: SignatureDigest = SignatureDigest.SHA256
  ): Promise<Buffer> {
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
