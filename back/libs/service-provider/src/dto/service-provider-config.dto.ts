import { IsString } from 'class-validator';

export class ServiceProviderConfig {
  @IsString()
  readonly clientSecretEcKey: string;
}
