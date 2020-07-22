import { IsString, IsIn, IsUrl, Contains, IsOptional } from 'class-validator';
import { Acr } from '@fc/oidc';

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
  @IsIn(Object.keys(Acr))
  // openid defined property names
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly acr_values: string;

  @IsString()
  @IsIn(['code'])
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
  @Contains('openid')
  readonly scope: string;

  @IsString()
  @IsIn(['login', 'consent', 'login consent', 'consent login'])
  @IsOptional()
  readonly prompt?: string;
}
