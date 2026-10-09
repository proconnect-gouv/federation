import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ collection: "crossDeviceAuthenticationRequest", strict: true })
export class CrossDeviceAuthenticationRequest extends Document {
  @Prop({ type: String, index: true, unique: true })
  id: string;

  @Prop({ type: String })
  status: string;

  @Prop({ type: String })
  hashedDeviceSecret: string;

  @Prop({ type: [String] })
  emojis: string[];

  @Prop({ type: String })
  userAgent: string;

  @Prop({ type: String })
  spName: string;

  @Prop({ type: String })
  email: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  expiresAt: Date;
}

const CrossDeviceAuthenticationRequestSchema = SchemaFactory.createForClass(
  CrossDeviceAuthenticationRequest,
);

export { CrossDeviceAuthenticationRequestSchema };
