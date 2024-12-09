import {
  IsAlphanumeric,
  IsArray,
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';

import { Split } from '@fc/common';
import { IsValidPrompt } from '@fc/oidc-provider';

/**
 * Control parameters on the authentication request.
 * @see https://openid.net/specs/openid-connect-core-1_0.html#rfc.section.3.1.2.1
 */
export class AuthorizeParamsDto {
  @IsString()
  readonly client_id: string;

  @IsString({ each: true })
  @IsArray()
  @Split(/[ ]+/, { maxLength: 64 })
  readonly acr_values: string;

  @IsOptional()
  @IsString()
  readonly claims?: string;

  @IsString()
  readonly response_type: string;

  @IsString()
  @IsAlphanumeric()
  @Length(64, 64)
  readonly nonce: string;

  @IsString()
  readonly state: string;

  @IsUrl({
    protocols: ['https'],
    // Validator.js defined property
    // eslint-disable-next-line @typescript-eslint/naming-convention
    require_protocol: true,
  })
  readonly redirect_uri: string;

  // The openid verification is made into oidc-provider
  @IsString()
  readonly scope: string;

  @IsString({ each: true })
  @Split(/[ ]+/, { maxLength: 64 })
  /**
   * @TODO #199 Retourner chez le FS en cas d'erreur
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/199
   *
   * @TODO #256
   * ETQ Dev, je supprime la valeur 'none' pour le prompt
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/256
   */
  @IsValidPrompt()
  @IsOptional()
  readonly prompt?: string;

  @IsString()
  @IsOptional()
  readonly sp_id?: string;

  @IsUrl()
  @IsOptional()
  readonly login_hint?: string;
}
