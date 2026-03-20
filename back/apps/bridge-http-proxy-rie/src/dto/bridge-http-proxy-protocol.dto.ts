import { BridgeProtocol, MessageType } from "@fc/hybridge-http-proxy";
import { IsEnum, IsNotEmptyObject } from "class-validator";

export class BridgeHttpProxyProtocolDto implements BridgeProtocol<object> {
  @IsEnum(MessageType)
  readonly type: MessageType;

  @IsNotEmptyObject()
  readonly data: object;
}
