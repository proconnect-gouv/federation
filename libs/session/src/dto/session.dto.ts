import { IsString, IsOptional, IsObject } from 'class-validator';
import { IOidcIdentity } from '@fc/oidc';

export class SessionDto {
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

  @IsString()
  @IsOptional()
  readonly idpState?: string;

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
}
