import {
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

// Creates a cyclic dependency
import { IsEqualToConfig, IsUrlRequiredTldFromConfig } from '@fc/common';

import { ServiceProviderAdapterMongoConfig } from './service-provider-adapter-mongo-config.dto';

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
  @IsString()
  readonly id_token_encrypted_response_alg: string;

  @IsOptional()
  @IsString()
  readonly id_token_encrypted_response_enc: string;

  @IsOptional()
  @IsString()
  readonly userinfo_encrypted_response_alg: string;

  @IsOptional()
  @IsString()
  readonly userinfo_encrypted_response_enc: string;

  @IsOptional()
  @IsUrlRequiredTldFromConfig()
  readonly jwks_uri?: string;

  @IsOptional()
  @IsBoolean()
  idpFilterExclude?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  idpFilterList?: string[];

  // 'public' = sp that accepts public servants only
  // 'private' = sp that also accepts private sector employees
  @IsString()
  @IsIn(['private', 'public'])
  readonly type: 'private' | 'public';

  @IsOptional()
  @IsBoolean()
  readonly identityConsent: boolean;

  @IsOptional()
  @IsBoolean()
  readonly ssoDisabled?: boolean;

  @IsOptional()
  @IsEqualToConfig<ServiceProviderAdapterMongoConfig>(
    'ServiceProviderAdapterMongo',
    'platform',
  )
  @IsString()
  readonly platform?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly rep_scope?: string[];
}
