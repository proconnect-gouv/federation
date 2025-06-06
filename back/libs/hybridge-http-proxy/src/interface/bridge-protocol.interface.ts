import { MessageType } from '../enums';

export interface BridgeProtocol<T = unknown> {
  type: MessageType;
  data: T;
}
