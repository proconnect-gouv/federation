import { IsNumber, IsObject, IsString } from "class-validator";

export class HyyyperbridgeResponseDto {
  @IsNumber()
  readonly status: number;

  @IsString()
  readonly statusText: string;

  @IsObject()
  readonly headers: Record<string, string>;

  /**
   * this parameter is voluntary abstract.
   * the proxy is not in charge to validate the exactness of the data itself
   */
  @IsString()
  readonly data: string;
}
