import type { IpLocation } from "#libs/ip-geolocation";
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

  // Approximate location of the requester: undefined while it is being looked
  // up, null if it is unknown
  @Prop({ type: Object })
  location?: IpLocation | null;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date })
  startedAt?: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

const CrossDeviceAuthenticationRequestSchema = SchemaFactory.createForClass(
  CrossDeviceAuthenticationRequest,
);

export { CrossDeviceAuthenticationRequestSchema };
