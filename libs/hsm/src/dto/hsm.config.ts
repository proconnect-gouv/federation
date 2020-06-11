import { IsString, IsNumber, IsPositive } from 'class-validator';

export class HsmConfig {
  @IsString()
  readonly libhsm: string;

  @IsString()
  readonly pin: string;

  @IsNumber()
  @IsPositive()
  readonly virtualHsmSlot: number;

  @IsString()
  readonly sigKeyCkaLabel: string;
}
