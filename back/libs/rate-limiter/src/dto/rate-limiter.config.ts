import { Type } from "class-transformer";
import { IsArray, IsEnum, IsInt, ValidateNested } from "class-validator";
import { RateLimiterKeyPrefix } from "../enum";

export class RateLimiterConfig {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RateLimiterParams)
  rateLimiterParams: RateLimiterParams[];
}

export class RateLimiterParams {
  @IsEnum(RateLimiterKeyPrefix)
  readonly keyPrefix: RateLimiterKeyPrefix;

  @IsInt()
  readonly points: number;

  @IsInt()
  readonly duration: number;
}
