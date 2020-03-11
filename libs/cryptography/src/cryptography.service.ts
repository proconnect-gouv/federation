import { Injectable } from '@nestjs/common';
import { IPivotIdentity } from './interfaces';

// @todo Implement this
@Injectable()
export class CryptographyService {
  /**
   * Generate a 64 characters string
   * @returns the 64 characters string
   */
  async generateState(): Promise<string> {
    return this.generateLocalRandomString();
  }

  /**
   * Generate a 64 characters string
   * @returns the 64 characters string
   */
  async generateNonce(): Promise<string> {
    return this.generateLocalRandomString();
  }

  /**
   * Encrypt the given UserInfos obtained when oidc-provider want to cache it.
   * Current implementation use symetrical AES-256-GCM.
   * @todo create an interface with the data schema obtained from oidc-provider
   * @param data the data to encrypt
   * @returns the cipher
   */
  async encryptUserInfosCache(data: any): Promise<Buffer> {
    // Linter killer
    data as unknown;

    return Buffer.from('cipherWithAes256Gcm', 'utf8');
  }

  /**
   * Decrypt the given UserInfos retrieved from cache for oidc-provider.
   * Current implementation use symetrical AES-256-GCM.
   * @todo create an interface with the data schema to transfer to oidc-provider
   * @param cipher the cipher to decrypt
   * @returns the data decrypted
   */
  async decryptUserInfosCache(cipher: any): Promise<Buffer> {
    // Linter killer
    cipher as unknown;

    return Buffer.from('data', 'utf8');
  }

  /**
   * Compute the identity hash
   * @param pivotIdentity
   * @returns the identity hash
   */
  computeIdentityHash(pivotIdentity: IPivotIdentity): string {
    // Linter killer
    pivotIdentity as unknown;

    return 'identityHash';
  }

  /**
   * Compute the sub, given an identity hash and a client id
   * @param identityHash the identity hash computed by calling "computeIdentityHash"
   * @param clientId the client id of the current SP
   * @returns the sub
   */
  computeSub(identityHash: string, clientId: string): string {
    // Linter killer
    identityHash as unknown;
    clientId as unknown;

    return 'sub';
  }

  /**
   * Decrypt the given cipher with asymetrical RSA-PKCS-OAEP
   * @param cipher the cipher to decrypt
   * @param privateKey RSA-PKCS-OAEP PEM formatted
   * @returns the jwt decrypted
   */
  async decryptJwt(
    cipher: Buffer,
    privateKey: Buffer,
  ): Promise<Buffer> {
    // Linter killer
    cipher as unknown;
    privateKey as unknown;

    return Buffer.from('jwt', 'utf8');
  }

  /**
   * Sign a jwt with asymetrical ECDSA-Prime256v1, given an identity hash and a client id
   * @param jwt a jwt formatted "<HEADER>.<PAYLOAD>"
   * @param privateKey ECDSA-Prime256v1 PEM formatted
   * @returns the jwt formatted "<HEADER>.<PAYLOAD>.<SIGNATURE>"
   */
  async signJwt(
    jwt: string,
    privateKey: Buffer,
  ): Promise<string> {
    // Linter killer
    jwt as unknown;
    privateKey as unknown;

    return 'jwtSignedWithEcdsaPrime256v1';
  }

  /**
   * Generate a random string without network
   * @param size by default 64 characters
   * @returns a random string of the given size
   */
  private async generateLocalRandomString(size = 64): Promise<string> {
    const random = Buffer.alloc(size);
    random.copy(
      Buffer.from(
        'This is a truly randm string, I assure you ;) !!!!!',
        'utf8',
      ),
    );

    return random.toString('utf8');
  }
}
