import { IsString } from 'class-validator';

export class CryptographyConfig {
  @IsString()
  readonly clientSecretEcKey: string;
}
