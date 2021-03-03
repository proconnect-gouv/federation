import { IsString } from 'class-validator';

export class IdentityProviderConfig {
  @IsString()
  readonly clientSecretEcKey: string;
}
