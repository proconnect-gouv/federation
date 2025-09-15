import { Document } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ strict: true, collection: 'client' })
export class ServiceProvider extends Document {
  @Prop({ type: String })
  name: string;

  @Prop({ type: Boolean })
  active: boolean;

  @Prop({ type: String, unique: true, index: true })
  key: string;

  @Prop({ type: String })
  client_secret: string;

  @Prop({ type: [String] })
  scopes: string[];

  @Prop({ type: [String] })
  redirect_uris: string[];

  @Prop({ type: String })
  id_token_signed_response_alg: string;

  @Prop({ type: String })
  userinfo_signed_response_alg: string;

  @Prop({ type: String })
  jwks_uri: string;

  @Prop({ type: String })
  type: string;
}

export const ServiceProviderSchema =
  SchemaFactory.createForClass(ServiceProvider);
