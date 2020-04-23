import * as crypto from 'crypto';
import { JWKS } from 'jose';
import { asInput } from 'jose/lib/help/key_object';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@fc/config';
import { FakeHsmConfig } from './dto';

@Injectable()
export class FakeHsmService {
  constructor(private readonly configService: ConfigService) {}
  /**
   * Sign data using crypto and a private key
   * @param data a serialized data
   * @param digest default to sha256 (Cf. crypto.createSign)
   * @returns signed data
   * Mock implementation
   */
  sign(data: Buffer, digest = 'sha256'): Promise<Buffer> {
    const { keys } = this.configService.get<FakeHsmConfig>('Hsm');

    /**
     * @TODO handle errors here
     * we could have valid keys in keystore but none for signature
     */
    const keystore = JWKS.asKeyStore({ keys });

    const privateKey = keystore.get({ alg: 'ES256', use: 'sig' });

    const key = {
      key: asInput(privateKey.keyObject, false),
      dsaEncoding: 'ieee-p1363',
    };

    return new Promise((resolve, reject) => {
      setImmediate(() => {
        try {
          const signed = crypto.sign(digest, data, key);
          resolve(signed);
        } catch (error) {
          reject(error);
        }
      });
    });
  }
}
