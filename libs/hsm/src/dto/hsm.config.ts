import { IsString } from 'class-validator';

export class HsmConfig {
  @IsString()
  readonly libhsm: string;

  @IsString()
  readonly pin: string;

  @IsString()
  readonly sigKeyCkaLabel: string;
}
