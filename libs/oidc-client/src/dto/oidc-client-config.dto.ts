import { IsArray, IsNumber, IsOptional } from 'class-validator';
import { ClientMetadata } from 'openid-client';

export class OidcClientConfig {
  @IsArray()
  @IsOptional()
  readonly providers?: ClientMetadata[];

  @IsNumber()
  readonly reloadConfigDelayInMs: number;
}
