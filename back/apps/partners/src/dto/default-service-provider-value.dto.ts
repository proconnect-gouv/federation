import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

import { ClientTypeEnum, PlatformEnum } from '@fc/service-provider';

export class DefaultServiceProviderLowValueConfig {
  @IsArray()
  readonly scope: string[];

  @IsArray()
  readonly claims: string[];

  @IsArray()
  readonly rep_scope: string[];

  @IsBoolean()
  readonly idpFilterExclude: boolean;

  @IsArray()
  readonly idpFilterList: string[];

  @IsBoolean()
  readonly active: boolean;

  @IsNumber()
  @IsIn([1, 2, 3])
  readonly eidas: number;

  @IsEnum(ClientTypeEnum)
  readonly type: ClientTypeEnum;

  @IsEnum(PlatformEnum)
  readonly platform: PlatformEnum;

  @IsBoolean()
  readonly identityConsent: boolean;

  @IsBoolean()
  readonly ssoDisabled: boolean;

  @IsString()
  readonly client_secret: string;

  @IsString()
  readonly client_id: string;

  @IsString()
  @IsOptional()
  readonly id_token_encrypted_response_alg?: string;

  @IsString()
  @IsOptional()
  readonly id_token_encrypted_response_enc?: string;

  @IsString()
  @IsOptional()
  readonly userinfo_signed_response_alg?: string;

  @IsString()
  @IsOptional()
  readonly userinfo_encrypted_response_alg?: string;

  @IsString()
  @IsOptional()
  readonly userinfo_encrypted_response_enc?: string;
}
