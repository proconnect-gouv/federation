/* istanbul ignore file */

// Declarative code
import { JWKECKey } from 'jose';
import { IsObject } from 'class-validator';

export class OverrideOidcProviderConfig {
  @IsObject()
  /** @TODO properly validate keys */
  readonly sigHsmPubKey: JWKECKey;
}
