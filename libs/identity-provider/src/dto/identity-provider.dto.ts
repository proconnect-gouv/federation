import {
  IsBoolean,
  IsString,
  IsArray,
  IsUrl,
  MinLength,
} from 'class-validator';

export class IdentityProviderDTO {
  @IsString()
  readonly uid: string;

  @IsString()
  readonly name: string;

  @IsBoolean()
  readonly active: boolean;

  @IsBoolean()
  readonly display: boolean;

  @IsString()
  readonly clientID: string;

  @IsString()
  @MinLength(32)
  readonly client_secret: string;

  @IsUrl()
  readonly discoveryUrl: string;

  @IsArray()
  @IsUrl({}, { each: true })
  readonly redirect_uris: string[];

  @IsArray()
  @IsUrl({}, { each: true })
  readonly post_logout_redirect_uris: string[];

  @IsArray()
  @IsString({ each: true })
  readonly response_types: string[];

  @IsString()
  readonly id_token_signed_response_alg: string;

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

  @IsString()
  readonly token_endpoint_auth_method: string;
}
