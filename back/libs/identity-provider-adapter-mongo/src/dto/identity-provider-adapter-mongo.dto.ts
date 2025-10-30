import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

import { IsUrlExtended } from '@fc/common/validators/is-url-extended.validator';

export class MetadataIdpAdapterMongoDTO {
  @IsString()
  readonly uid: string;

  @IsOptional()
  @IsUrlExtended()
  @Transform(({ value }) => value || undefined)
  readonly url: string;

  @IsString()
  readonly name: string;

  @IsString()
  readonly title: string;

  @IsBoolean()
  readonly active: boolean;

  @IsString()
  readonly clientID: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || undefined)
  readonly userinfo_signed_response_alg?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || undefined)
  readonly userinfo_encrypted_response_alg?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || undefined)
  readonly userinfo_encrypted_response_enc?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || undefined)
  readonly id_token_signed_response_alg?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || undefined)
  readonly id_token_encrypted_response_alg?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || undefined)
  readonly id_token_encrypted_response_enc?: string;

  @IsString()
  readonly token_endpoint_auth_method: string;

  @IsString()
  @MinLength(32)
  readonly client_secret: string;

  // issuer metadata
  @IsOptional()
  @IsUrlExtended()
  @Transform(({ value }) => value || undefined)
  readonly endSessionURL?: string;

  @IsBoolean()
  readonly discovery: boolean;

  @IsString()
  readonly siret: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || undefined)
  readonly supportEmail?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => value || undefined)
  readonly fqdns?: string[];

  @IsBoolean()
  readonly isRoutingEnabled: boolean;
}

export class DiscoveryIdpAdapterMongoDTO extends MetadataIdpAdapterMongoDTO {
  @IsUrlExtended()
  readonly discoveryUrl: string;
}

export class NoDiscoveryIdpAdapterMongoDTO extends MetadataIdpAdapterMongoDTO {
  @IsOptional()
  @IsUrlExtended()
  @Transform(({ value }) => value || undefined)
  readonly jwksURL?: string | undefined;

  @IsUrlExtended()
  readonly authzURL: string;

  @IsUrlExtended()
  readonly tokenURL: string;

  @IsUrlExtended()
  readonly userInfoURL: string;
}
