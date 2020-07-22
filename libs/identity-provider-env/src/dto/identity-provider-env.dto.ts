import {
  IsBoolean,
  IsString,
  IsArray,
  IsUrl,
  MinLength,
} from 'class-validator';

export class IdentityProviderEnvDTO {
  @IsString()
  readonly uid: string;

  @IsString()
  readonly name: string;

  @IsBoolean()
  readonly active: boolean;

  @IsBoolean()
  readonly display: boolean;

  @IsString()
  // openid defined property names
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly client_id: string;

  @IsString()
  @MinLength(32)
  // openid defined property names
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly client_secret: string;

  @IsUrl()
  readonly discoveryUrl: string;

  @IsArray()
  @IsUrl({}, { each: true })
  // openid defined property names
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly redirect_uris: string[];

  @IsArray()
  @IsUrl({}, { each: true })
  // openid defined property names
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly post_logout_redirect_uris: string[];

  @IsArray()
  @IsString({ each: true })
  // openid defined property names
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly response_types: string[];

  @IsString()
  // openid defined property names
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly id_token_signed_response_alg: string;

  @IsString()
  // openid defined property names
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly id_token_encrypted_response_alg: string;

  @IsString()
  // openid defined property names
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly id_token_encrypted_response_enc: string;

  @IsString()
  // openid defined property names
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly userinfo_signed_response_alg: string;

  @IsString()
  // openid defined property names
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly userinfo_encrypted_response_alg: string;

  @IsString()
  // openid defined property names
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly userinfo_encrypted_response_enc: string;

  @IsString()
  // openid defined property names
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly token_endpoint_auth_method: string;

  @IsString()
  // openid defined property names
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly revocation_endpoint_auth_method: string;

  @IsUrl()
  // openid defined property names
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly jwks_uri: string;
}
