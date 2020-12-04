import { IsAscii, IsOptional, IsString, MinLength } from 'class-validator';

export class CryptographyConfig {
  @IsString()
  readonly clientSecretEcKey: string;

  @IsAscii()
  @MinLength(8)
  /**
   * @todo this key is specififc to FC and should be extract from Cryptography
   */
  @IsOptional()
  readonly subSecretKey: string;
}
