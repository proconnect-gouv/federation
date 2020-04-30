import { Document } from 'mongoose';

export interface IServiceProvider extends Document {
  active: boolean;
  key: string;
  client_secret: string;
  redirect_uris: string[];
  id_token_signed_response_alg: string;
  id_token_encrypted_response_alg: string;
  id_token_encrypted_response_enc: string;
  userinfo_signed_response_alg: string;
  userinfo_encrypted_response_alg: string;
  userinfo_encrypted_response_enc: string;
  jwks_uri: string;
}
