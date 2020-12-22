import {
  IsString,
  IsUrl,
  Contains,
  IsOptional,
  IsArray,
  IsAlphanumeric,
  Length,
} from 'class-validator';
import { Split } from '@fc/common';
import { IsValidPrompt } from '../validators';

/**
 * Control parameters on the authentication request.
 * @see https://openid.net/specs/openid-connect-core-1_0.html#rfc.section.3.1.2.1
 */
export class AuthorizeParamsDTO {
  @IsString()
  // openid defined property names
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly client_id: string;

  @IsString({ each: true })
  @IsArray()
  @Split(/[ ]+/)
  // openid defined property names
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly acr_values: string;

  @IsString()
  // openid defined property names
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly response_type: string;

  @IsString()
  @IsAlphanumeric()
  @Length(64, 64)
  readonly nonce: string;

  @IsString()
  readonly state: string;

  @IsUrl()
  // openid defined property names
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly redirect_uri: string;

  @IsString()
  /**
   * @TODO #197 Retourner chez le FS en cas d'erreur
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/197
   */
  @Contains('openid')
  readonly scope: string;

  @IsString({ each: true })
  @IsArray()
  @Split(/[ ]+/)
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
}
