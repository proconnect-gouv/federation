import { IsString, IsOptional, IsObject } from 'class-validator';
import { IOidcIdentity } from '@fc/oidc';
import { IsRegisteredHandler } from '@fc/feature-handler';

export class SessionDto {
  @IsString({ each: true })
  @IsOptional()
  readonly amr?: string[];

  @IsString()
  @IsOptional()
  readonly sessionId?: string;

  @IsString()
  @IsOptional()
  readonly spId: string;

  @IsString()
  @IsOptional()
  readonly spAcr: string;

  @IsString()
  @IsOptional()
  readonly spName: string;

  @IsObject()
  @IsOptional()
  readonly spIdentity?: IOidcIdentity;

  @IsRegisteredHandler()
  @IsOptional()
  readonly spFeatureHandler?: string;

  @IsString()
  @IsOptional()
  readonly idpState?: string;

  @IsString()
  @IsOptional()
  readonly idpNonce?: string;

  @IsString()
  @IsOptional()
  readonly idpId?: string;

  @IsString()
  @IsOptional()
  readonly idpAcr?: string;

  @IsString()
  @IsOptional()
  readonly idpName?: string;

  @IsObject()
  @IsOptional()
  readonly idpIdentity?: IOidcIdentity;

  @IsString()
  @IsOptional()
  readonly csrfToken?: string;

  @IsString()
  @IsOptional()
  readonly idpAccessToken?: string;

  @IsRegisteredHandler()
  @IsOptional()
  readonly idpFeatureHandler?: string;
}
