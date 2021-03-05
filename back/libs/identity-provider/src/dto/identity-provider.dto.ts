import {
  IsBoolean,
  IsString,
  IsArray,
  IsUrl,
  MinLength,
  NotContains,
  ValidateIf,
  IsOptional,
} from 'class-validator';
import {
  IFeatureHandlerDatabaseMap,
  IsRegisteredHandler,
} from '@fc/feature-handler';

export class IdentityProviderDTO {
  @IsString()
  @IsOptional()
  readonly url: string;

  @IsString()
  readonly uid: string;

  @IsString()
  readonly name: string;

  @IsString()
  @NotContains('/')
  readonly image: string;

  @IsString()
  readonly title: string;

  @IsBoolean()
  readonly active: boolean;

  @IsBoolean()
  readonly display: boolean;

  @IsString()
  readonly clientID: string;

  @IsString()
  @MinLength(32)
  // openid defined property names
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly client_secret: string;

  @IsString()
  @IsOptional()
  // openid defined property names
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly authzURL: string;

  @IsString()
  @IsOptional()
  readonly tokenURL: string;

  @IsString()
  @IsOptional()
  readonly userInfoURL: string;

  @IsString()
  @IsOptional()
  readonly endSessionURL: string;

  @IsString()
  @IsOptional()
  readonly jwksURL: string;

  @IsBoolean()
  readonly discovery: boolean;

  @ValidateIf((o) => o.dicovery)
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

  @IsRegisteredHandler()
  readonly featureHandlers: IFeatureHandlerDatabaseMap;
}
