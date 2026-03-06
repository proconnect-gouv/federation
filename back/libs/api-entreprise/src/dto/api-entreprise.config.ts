import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class ApiEntrepriseConfig {
  @IsString()
  readonly token: string;

  @IsString()
  readonly baseUrl: string;

  @IsBoolean()
  @IsOptional()
  readonly shouldMockApi?: boolean;

  @IsBoolean()
  readonly featureFetchOrganizationData: boolean;

  @IsString()
  readonly organizationSiret: string;

  @IsNumber()
  readonly cachedTTL: number;
}
