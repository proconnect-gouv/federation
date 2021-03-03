/* istanbul ignore file */

// Declarative code
import {
  IsOptional,
  IsObject,
  IsUrl,
  IsBoolean,
  ValidateIf,
  IsString,
} from 'class-validator';
import { ClientMetadata } from 'openid-client';
import { JSONWebKeySet } from 'jose';

export class IdentityProviderEnvConfig {
  // Mock Service Provider
  @IsObject()
  @IsOptional()
  readonly provider: ClientMetadata;

  @IsBoolean()
  readonly discovery: boolean;

  @IsUrl()
  @IsOptional()
  @ValidateIf((o) => o.discovery)
  readonly discoveryUrl: string;

  /**
   * @TODO #143 validate the structure of JSONWebKeySet
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/143
   */
  @IsObject()
  readonly jwks: JSONWebKeySet;

  @IsString()
  readonly clientSecretEcKey: string;
}
