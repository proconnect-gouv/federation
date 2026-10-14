import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { RequestStatus } from "../enums/request-status.enum";

@Schema({ collection: "crossDeviceAuthenticationRequest", strict: true })
export class CrossDeviceAuthenticationRequest extends Document {
  @Prop({ type: String })
  status: RequestStatus;

  @Prop({ type: [String] })
  emojis: string[];

  @Prop({ type: String })
  userAgent: string;

  @Prop({ type: String })
  spName: string;

  @Prop({ type: String })
  browsingSessionId: string;

  @Prop({ type: String })
  email: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

const CrossDeviceAuthenticationRequestSchema = SchemaFactory.createForClass(
  CrossDeviceAuthenticationRequest,
);

export { CrossDeviceAuthenticationRequestSchema };
