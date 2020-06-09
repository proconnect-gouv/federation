/* istanbul ignore file */

// Declarative code
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsObject,
  IsPositive,
} from 'class-validator';
import { ClientMetadata } from 'openid-client';
import { JSONWebKeySet } from 'jose';

export class OidcClientConfig {
  @IsArray()
  @IsOptional()
  readonly providers?: ClientMetadata[];

  @IsNumber()
  @IsPositive()
  readonly reloadConfigDelayInMs: number;

  /* @TODO validate the structure of JSONWebKeySet */
  @IsObject()
  readonly jwks: JSONWebKeySet;
}
