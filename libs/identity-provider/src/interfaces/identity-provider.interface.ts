import { Document } from 'mongoose';

export interface IIdentityProvider extends Document {
  name: string;
  clientID: string;
  client_secret: string;
  discoveryUrl: string;
  redirect_uris: string[];
  post_logout_redirect_uris: string[];
  response_types: string[];
  id_token_signed_response_alg: string;
  token_endpoint_auth_method: string;
  id_token_encrypted_response_alg: string;
  id_token_encrypted_response_enc: string;
  userinfo_signed_response_alg: string;
  userinfo_encrypted_response_alg: string;
  userinfo_encrypted_response_enc: string;
}
