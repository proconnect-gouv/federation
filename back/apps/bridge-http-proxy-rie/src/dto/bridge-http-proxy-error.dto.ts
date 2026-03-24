import { BridgeError } from "@fc/hybridge-http-proxy";
import { IsOptional, IsString } from "class-validator";

export class BridgeHttpProxyErrorDto implements BridgeError {
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
