import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
/**
 * @TODO #1024 MAJ Jose version 3.X
 * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/1024
 * @ticket #FC-1024
 */
import { JSONWebKeySet } from 'jose-v2';

import { IdentityProviderMetadata } from '@fc/oidc';

class HttpOptions {
  @IsString()
  @MinLength(1)
  @IsOptional()
  readonly key?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  readonly cert?: string;

  @IsNumber()
  readonly timeout: number;
}

export class OidcClientConfig {
  @IsArray()
  @IsOptional()
  readonly providers?: IdentityProviderMetadata[];

  @ValidateNested()
  @Type(() => HttpOptions)
  readonly httpOptions: HttpOptions;

  /**
   * @TODO #143 validate the structure of JSONWebKeySet
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/143
   * When oidc-client will be using v3+ of jose feel free to replace it
   * by { keys: Keylike[] } type instead.
   */
  @IsOptional()
  @IsObject()
  readonly jwks?: JSONWebKeySet;

  @IsNumber()
  @Min(32)
  readonly stateLength: number;

  @IsString()
  @IsOptional()
  readonly scope?: string;

  @IsString()
  @IsOptional()
  readonly claims?: string;

  @IsBoolean()
  readonly fapi: boolean;

  @IsUrl({
    protocols: ['https'],
    // Validator.js defined property
    // eslint-disable-next-line @typescript-eslint/naming-convention
    require_protocol: true,
  })
  readonly redirectUri: string;

  @IsUrl({
    protocols: ['https'],
    // Validator.js defined property
    // eslint-disable-next-line @typescript-eslint/naming-convention
    require_protocol: true,
  })
  readonly postLogoutRedirectUri: string;
}
