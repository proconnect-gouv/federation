import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
} from "class-validator";

export class IpGeolocationConfig {
  @IsUrl()
  readonly baseUrl: string;

  @IsString()
  readonly accountId: string;

  @IsString()
  readonly licenseKey: string;

  @IsBoolean()
  @IsOptional()
  readonly shouldMockApi?: boolean;

  @IsInt()
  @IsPositive()
  readonly timeoutInMs: number;
}
