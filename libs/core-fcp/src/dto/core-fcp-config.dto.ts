import { IsObject, ValidateNested } from 'class-validator';
import { OidcProviderConfig } from '@fc/oidc-provider';
import { Type } from 'class-transformer';

export class CoreFcpConfig {
  @IsObject()
  readonly App: any;

  @IsObject()
  @ValidateNested()
  @Type(() => OidcProviderConfig)
  readonly OidcProvider: OidcProviderConfig;
}
