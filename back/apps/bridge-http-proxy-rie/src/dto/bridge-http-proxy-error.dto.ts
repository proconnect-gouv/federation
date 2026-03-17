import { BridgeError } from "@fc/hybridge-http-proxy";
import { IsNumber, IsString } from "class-validator";

export class BridgeHttpProxyErrorDto implements BridgeError {
  @IsNumber()
  readonly code: number;

  @IsString()
  readonly reason: string;

  @IsString()
  readonly name: string;
}
