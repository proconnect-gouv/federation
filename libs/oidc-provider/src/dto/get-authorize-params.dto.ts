import { IsString, IsIn, IsUrl, Contains, IsOptional } from 'class-validator';
import { Acr } from '@fc/oidc';

/**
 * Control parameters on the authentication request.
 * @see https://openid.net/specs/openid-connect-core-1_0.html#rfc.section.3.1.2.1
 */
export class GetAuthorizeParamsDTO {
  @IsString()
  readonly client_id: string;

  @IsString()
  @IsIn(Object.keys(Acr))
  readonly acr_values: string;

  @IsString()
  @IsIn(['code'])
  readonly response_type: string;

  @IsString()
  readonly nonce: string;

  @IsString()
  readonly state: string;

  @IsUrl()
  readonly redirect_uri: string;

  @IsString()
  @Contains('openid')
  readonly scope: string;

  @IsString()
  @IsIn(['login', 'consent', 'login consent', 'consent login'])
  @IsOptional()
  readonly prompt?: string;
}
