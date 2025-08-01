import { Document, Schema as SchemaNative } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'provider', strict: true })
export class IdentityProvider extends Document {
  @Prop({ type: String })
  name: string;

  @Prop({ index: true, type: String })
  clientID: string;

  @Prop({ type: Boolean })
  isBeta: boolean;

  @Prop({ type: String })
  client_secret: string;

  @Prop({ type: String })
  discovery: boolean;

  @Prop({ type: String })
  discoveryUrl: string;

  @Prop({ type: [String] })
  response_types: string[];

  @Prop({ type: String })
  id_token_signed_response_alg: string;

  @Prop({ type: String })
  token_endpoint_auth_method: string;

  @Prop({ type: String })
  id_token_encrypted_response_alg: string;

  @Prop({ type: String })
  id_token_encrypted_response_enc: string;

  @Prop({ type: String })
  uid: string;

  @Prop({ type: String })
  userinfo_signed_response_alg: string;

  @Prop({ type: String })
  userinfo_encrypted_response_alg: string;

  @Prop({ type: String })
  userinfo_encrypted_response_enc: string;

  @Prop({ type: SchemaNative.Types.Mixed })
  featureHandlers: any;

  @Prop({ type: [String] })
  allowedAcr: string[];

  @Prop({ type: String })
  siret: string;

  @Prop({ type: String, required: false })
  supportEmail: string;
}

export const IdentityProviderSchema =
  SchemaFactory.createForClass(IdentityProvider);
