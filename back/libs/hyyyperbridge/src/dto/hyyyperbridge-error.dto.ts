import { IsOptional, IsString } from "class-validator";

export class HyyyperbridgeErrorDto {
  @IsString()
  @IsOptional()
  readonly code?: string;

  @IsString()
  @IsOptional()
  readonly reason?: string;

  @IsString()
  @IsOptional()
  readonly name?: string;
}
