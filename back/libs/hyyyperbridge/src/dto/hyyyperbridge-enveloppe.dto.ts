import { IsEnum, IsNotEmptyObject } from "class-validator";
import { HyyyperbridgeMessageType } from "../enums/hyyyperbridge-message-type.enum";

export class HyyyperbridgeEnveloppeDto {
  @IsEnum(HyyyperbridgeMessageType)
  readonly type!: HyyyperbridgeMessageType;

  @IsNotEmptyObject()
  readonly data!: object;
}
