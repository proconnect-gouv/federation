/* istanbul ignore file */

// Declarative code
import { IsNumber, IsString } from 'class-validator';

import { BridgeError } from '@fc/rie';

export class BridgeErrorDto implements BridgeError {
  @IsNumber()
  readonly code: number;

  @IsString()
  readonly reason: string;

  @IsString()
  readonly name: string;
}
