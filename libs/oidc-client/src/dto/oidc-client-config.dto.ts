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

  /**
   * @TODO #143 validate the structure of JSONWebKeySet
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/143
   */
  @IsObject()
  readonly jwks: JSONWebKeySet;
}
