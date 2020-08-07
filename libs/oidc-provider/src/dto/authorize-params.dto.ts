import {
  IsString,
  IsIn,
  IsUrl,
  Contains,
  IsOptional,
  IsArray,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { split } from '@fc/common';
import { Acr } from '@fc/oidc';
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

  @IsString()
  /**
   * @TODO #184
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/184
   */
  @IsIn(Object.keys(Acr))
  // openid defined property names
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly acr_values: string;

  @IsString()
  // openid defined property names
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly response_type: string;

  @IsString()
  @IsOptional()
  readonly nonce?: string;

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

  @IsArray()
  @Transform(split(/[ ]+/))
  /**
   * @TODO #199 Retourner chez le FS en cas d'erreur
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/199
   * @TODO To be fully compliant with oidc, you can't have the value "none"
   * alongside others. This is not supported actually.
   */
  @IsValidPrompt()
  @IsOptional()
  readonly prompt?: string;
}
