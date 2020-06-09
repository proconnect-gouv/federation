import {
  IsBoolean,
  IsString,
  IsArray,
  IsUrl,
  MinLength,
  IsIn,
} from 'class-validator';

const SUPPORTED_SIG_ALG = ['ES256', 'ES512'];

export class ServiceProviderDTO {
  @IsBoolean()
  readonly active: boolean;

  @IsString()
  readonly key: string;

  @IsString()
  readonly name: string;

  @IsString()
  @MinLength(32)
  readonly client_secret: string;

  @IsArray()
  @IsUrl({}, { each: true })
  readonly redirect_uris: string[];

  @IsArray()
  @IsUrl({}, { each: true })
  readonly post_logout_redirect_uris: string[];

  @IsArray()
  @IsString({ each: true })
  readonly scopes: string[];

  @IsString()
  @IsIn(SUPPORTED_SIG_ALG)
  readonly id_token_signed_response_alg: 'ES256' | 'ES512';

  @IsString()
  readonly id_token_encrypted_response_alg: string;

  @IsString()
  readonly id_token_encrypted_response_enc: string;

  @IsString()
  readonly userinfo_signed_response_alg: string;

  @IsString()
  readonly userinfo_encrypted_response_alg: string;

  @IsString()
  readonly userinfo_encrypted_response_enc: string;

  @IsUrl()
  readonly jwks_uri: string;
}
