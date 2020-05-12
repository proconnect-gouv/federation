import { IsString } from 'class-validator';

export class CryptographyConfig {
  @IsString()
  readonly clientSecretEcKey: string;

  @IsString()
  readonly identityHashSalt: string;
}
