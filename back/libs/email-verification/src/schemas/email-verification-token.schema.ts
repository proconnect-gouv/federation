import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ collection: "emailVerificationToken", strict: true })
export class EmailVerificationToken extends Document {
  @Prop({ type: String, index: true })
  email: string;

  @Prop({ type: String })
  token: string;

  @Prop({ type: Date })
  sentAt: Date;
}

const EmailVerificationTokenSchema = SchemaFactory.createForClass(
  EmailVerificationToken,
);

export { EmailVerificationTokenSchema };
