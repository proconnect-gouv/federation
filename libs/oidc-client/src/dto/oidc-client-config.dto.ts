import { IsArray, IsNumber, IsOptional, IsObject } from 'class-validator';
import { ClientMetadata } from 'openid-client';
import { JSONWebKeySet } from 'jose';

export class OidcClientConfig {
  @IsArray()
  @IsOptional()
  readonly providers?: ClientMetadata[];

  @IsNumber()
  readonly reloadConfigDelayInMs: number;

  @IsObject()
  readonly jwks: JSONWebKeySet;
}
