/* istanbul ignore file */

import { IsString, Length } from 'class-validator';

export class IdentityConfig {
  /**
   * @TODO evaluate the opportunity to use keyObjects
   * instead of plain string + rotation of keys
   */
  @IsString()
  @Length(32, 32)
  readonly cryptographyKey: string;
}
