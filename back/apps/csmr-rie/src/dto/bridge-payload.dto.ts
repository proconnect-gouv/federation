import { Transform } from "class-transformer";
import { IsIn, IsObject, IsOptional, IsString, IsUrl } from "class-validator";

export class BridgePayloadDto {
  @IsUrl()
  readonly url: string;

  @IsIn(["get", "post"])
  @Transform(
    /* istanbul ignore next */
    ({ value }) => value.toLowerCase(),
  )
  readonly method: string;

  @IsObject()
  readonly headers: Record<string, string>;

  /**
   * this parameter is voluntary abstract.
   * the proxy is not in charge to validate the exactness of the data itself
   */
  @IsString()
  @IsOptional()
  readonly data?: string;
}
