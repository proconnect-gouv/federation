import { IsString, IsNumber, Min } from 'class-validator';

export class CryptographyConfig {
  @IsString()
  readonly clientSecretEcKey: string;

  @IsString()
  readonly identityHashSalt: string;

  @IsNumber()
  @Min(32)
  readonly sessionIdLength: number;
}
