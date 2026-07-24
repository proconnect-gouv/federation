import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ collection: "emailVerificationToken", strict: true })
export class EmailVerificationToken extends Document {
  @Prop({ type: String })
  email: string;

  @Prop({ type: String })
  token: string;

  @Prop({ type: Date })
  sentAt: Date;
}

export const EmailVerificationTokenSchema = SchemaFactory.createForClass(
  EmailVerificationToken,
);
