import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
  Validate,
} from 'class-validator';

import { Amr } from '../enums';
import { JwksUriValidator } from './jwksuri.validator';

export class MetadataIdpAdapterMongoDTO {
  @IsString()
  readonly uid: string;

  @IsUrl()
  @IsOptional()
  readonly url: string;

  @IsString()
  readonly name: string;

  @IsString()
  readonly title: string;

  @IsBoolean()
  readonly active: boolean;

  @IsEnum(Amr, { each: true })
  @IsOptional()
  readonly amr?: Amr[];

  @IsString()
  readonly clientID: string;

  @IsOptional()
  @IsString()
  readonly userinfo_signed_response_alg?: string;

  @IsOptional()
  @IsString()
  readonly userinfo_encrypted_response_alg?: string;

  @IsOptional()
  @IsString()
  readonly userinfo_encrypted_response_enc?: string;

  @IsOptional()
  @IsString()
  readonly id_token_signed_response_alg?: string;

  @IsOptional()
  @IsString()
  readonly id_token_encrypted_response_alg?: string;

  @IsOptional()
  @IsString()
  readonly id_token_encrypted_response_enc?: string;

  @IsString()
  readonly token_endpoint_auth_method: string;

  @IsString()
  @MinLength(32)
  readonly client_secret: string;

  // issuer metadata
  @IsString()
  @IsOptional()
  readonly endSessionURL: string;

  @IsBoolean()
  readonly discovery: boolean;

  @IsString()
  readonly siret: string;

  @IsOptional()
  @IsString()
  readonly supportEmail: string;
}

export class DiscoveryIdpAdapterMongoDTO extends MetadataIdpAdapterMongoDTO {
  @IsUrl()
  readonly discoveryUrl: string;
}

export class NoDiscoveryIdpAdapterMongoDTO extends MetadataIdpAdapterMongoDTO {
  @IsOptional()
  @Validate(JwksUriValidator)
  readonly jwksURL: string | undefined;

  @IsString()
  readonly authzURL: string;

  @IsString()
  readonly tokenURL: string;

  @IsString()
  readonly userInfoURL: string;
}
