/* istanbul ignore file */

// Declarative code
import { JWKECKey } from 'jose';
import { IsObject } from 'class-validator';

export class OverrideOidcProviderConfig {
  @IsObject()
  /**
   * @TODO #143 properly validate keys
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/143
   */
  readonly sigHsmPubKey: JWKECKey;
}
