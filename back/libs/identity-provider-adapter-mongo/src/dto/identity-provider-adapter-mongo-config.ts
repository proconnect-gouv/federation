import { IsString } from 'class-validator';

export class IdentityProviderAdapterMongoConfig {
  @IsString()
  readonly clientSecretEcKey: string;
}
