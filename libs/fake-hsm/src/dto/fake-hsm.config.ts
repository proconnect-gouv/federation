import { IsArray } from 'class-validator';
import { JWKECKey, JWKRSAKey } from 'jose';

export class FakeHsmConfig {
  @IsArray()
  /** @TODO properly validate keys */
  readonly keys: Array<JWKECKey | JWKRSAKey>;
}
