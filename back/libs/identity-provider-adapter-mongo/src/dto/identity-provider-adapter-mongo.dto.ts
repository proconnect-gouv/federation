import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

const URL_REGEX = /^https?:\/\/[^/].+$/;

export class MetadataIdpAdapterMongoDTO {
  @IsString()
  readonly uid: string;

  @IsOptional()
  @Matches(URL_REGEX)
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
  @IsOptional()
  @Matches(URL_REGEX)
  readonly endSessionURL: string;

  @IsBoolean()
  readonly discovery: boolean;

  @IsString()
  readonly siret: string;

  @IsOptional()
  @IsString()
  readonly supportEmail: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly fqdns?: string[];

  @IsBoolean()
  readonly isRoutingEnabled: boolean;
}

export class DiscoveryIdpAdapterMongoDTO extends MetadataIdpAdapterMongoDTO {
  @Matches(URL_REGEX)
  readonly discoveryUrl: string;
}

export class NoDiscoveryIdpAdapterMongoDTO extends MetadataIdpAdapterMongoDTO {
  @IsOptional()
  @Matches(URL_REGEX)
  readonly jwksURL: string | undefined;

  @Matches(URL_REGEX)
  readonly authzURL: string;

  @Matches(URL_REGEX)
  readonly tokenURL: string;

  @Matches(URL_REGEX)
  readonly userInfoURL: string;
}
