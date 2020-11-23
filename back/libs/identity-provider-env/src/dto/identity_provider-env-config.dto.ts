/* istanbul ignore file */

// Declarative code
import { IsOptional, IsObject, IsUrl } from 'class-validator';
import { ClientMetadata } from 'openid-client';
import { JSONWebKeySet } from 'jose';

export class IdentityProviderEnvConfig {
  // Mock Service Provider
  @IsObject()
  @IsOptional()
  readonly provider: ClientMetadata;

  @IsUrl()
  @IsOptional()
  readonly discoveryUrl: string;

  /**
   * @TODO #143 validate the structure of JSONWebKeySet
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/143
   */
  @IsObject()
  readonly jwks: JSONWebKeySet;
}
