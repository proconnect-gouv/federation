import { IsString, IsIn, IsUrl, Contains } from 'class-validator';
import { Acr } from '@fc/oidc';

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
}
