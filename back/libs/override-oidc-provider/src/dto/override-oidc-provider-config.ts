import { KeyLike } from 'crypto';

import { IsObject } from 'class-validator';

export class OverrideOidcProviderConfig {
  @IsObject({ each: true })
  /**
   * @TODO #143 properly validate keys
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/143
   */
  readonly sigHsmPubKeys: KeyLike[];
}
