/* istanbul ignore file */

import { IsNotEmpty, IsString } from 'class-validator';

// Declarative code
export class HttpsOptionDto {
  @IsString()
  @IsNotEmpty()
  readonly key: string;

  @IsString()
  @IsNotEmpty()
  readonly cert: string;
}
