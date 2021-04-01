import { IsString } from 'class-validator';

export class ServiceProviderAdapterMongoConfig {
  @IsString()
  readonly clientSecretEcKey: string;
}
