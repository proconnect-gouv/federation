import {
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

// Creates a cyclic dependency
import { IsUrlRequiredTldFromConfig } from '@fc/common';

export class ServiceProviderAdapterMongoDTO {
  @IsBoolean()
  readonly active: boolean;

  @IsString()
  readonly key: string;

  @IsString() // HSM
  @MinLength(32)
  readonly entityId: string;

  @IsString()
  readonly name: string;

  @IsString()
  readonly title: string;

  @IsString()
  @MinLength(32)
  readonly client_secret: string;

  @IsArray()
  @IsUrlRequiredTldFromConfig({ each: true })
  readonly redirect_uris: string[];

  @IsArray()
  @IsUrlRequiredTldFromConfig({ each: true })
  readonly post_logout_redirect_uris: string[];

  @IsArray()
  @IsString({ each: true })
  readonly scopes: string[];

  @IsString()
  @IsIn(['ES256', 'RS256', 'HS256'])
  readonly id_token_signed_response_alg: 'ES256' | 'RS256' | 'HS256';

  @IsString()
  readonly userinfo_signed_response_alg: string;

  @IsOptional()
  @IsUrlRequiredTldFromConfig()
  readonly jwks_uri?: string;

  // 'public' = sp that accepts public servants only
  // 'private' = sp that also accepts private sector employees
  @IsString()
  @IsIn(['private', 'public'])
  readonly type: 'private' | 'public';
}
