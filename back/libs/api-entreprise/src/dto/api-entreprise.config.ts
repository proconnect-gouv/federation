import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ApiEntrepriseConfig {
  @IsString()
  readonly token: string;

  @IsString()
  readonly baseUrl: string;

  @IsBoolean()
  @IsOptional()
  readonly shouldMockApi?: boolean;
}
