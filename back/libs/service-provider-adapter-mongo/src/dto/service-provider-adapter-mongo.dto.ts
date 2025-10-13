import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

import { IsUrlExtended } from '@fc/common/validators/is-url-extended.validator';

export class ServiceProviderAdapterMongoDTO {
  @IsBoolean()
  readonly active: boolean;

  @IsString()
  readonly key: string;

  @IsString()
  readonly name: string;

  @IsString()
  readonly title: string;

  @IsString()
  @MinLength(32)
  readonly client_secret: string;

  @IsArray()
  @IsUrlExtended({ each: true })
  readonly redirect_uris: string[];

  @IsArray()
  @IsUrlExtended({ each: true })
  readonly post_logout_redirect_uris: string[];

  @IsArray()
  @IsString({ each: true })
  readonly scopes: string[];

  @IsString()
  @IsIn(['ES256', 'RS256', 'HS256'])
  readonly id_token_signed_response_alg: 'ES256' | 'RS256' | 'HS256';

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || undefined)
  readonly userinfo_signed_response_alg?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || undefined)
  readonly introspection_signed_response_alg?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || undefined)
  readonly introspection_encrypted_response_alg?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || undefined)
  readonly introspection_encrypted_response_enc?: string;

  @IsOptional()
  @IsUrlExtended()
  @Transform(({ value }) => value || undefined)
  readonly jwks_uri?: string;

  // 'public' = sp that accepts public servants only
  // 'private' = sp that also accepts private sector employees
  @IsString()
  @IsIn(['private', 'public'])
  readonly type: 'private' | 'public';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => value || undefined)
  readonly response_types?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => value || undefined)
  readonly grant_types?: string[];
}
