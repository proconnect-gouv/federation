/* istanbul ignore file */

// Declarative code
import { IsString, IsNumber, Min } from 'class-validator';

export class HsmConfig {
  @IsString()
  readonly libhsm: string;

  @IsString()
  readonly pin: string;

  @IsNumber()
  @Min(0)
  readonly virtualHsmSlot: number;

  @IsString()
  readonly sigKeyCkaLabel: string;
}
