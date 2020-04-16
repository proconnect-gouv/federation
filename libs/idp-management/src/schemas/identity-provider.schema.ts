import * as mongoose from 'mongoose';

export const IdentityProviderSchema = new mongoose.Schema(
  {
    name: String,
    clientID: String,
    clientSecretHash: String,
    discoveryUrl: String,
    // oidc defined variable name
    // eslint-disable-next-line @typescript-eslint/camelcase
    redirect_uris: [String],
    // oidc defined variable name
    // eslint-disable-next-line @typescript-eslint/camelcase
    response_types: [String],
    // oidc defined variable name
    // eslint-disable-next-line @typescript-eslint/camelcase
    id_token_signed_response_alg: String,
    // oidc defined variable name
    // eslint-disable-next-line @typescript-eslint/camelcase
    token_endpoint_auth_method: String,
    // oidc defined variable name
    // eslint-disable-next-line @typescript-eslint/camelcase
    id_token_encrypted_response_alg: String,
    // oidc defined variable name
    // eslint-disable-next-line @typescript-eslint/camelcase
    id_token_encrypted_response_enc: String,
    // oidc defined variable name
    // eslint-disable-next-line @typescript-eslint/camelcase
    userinfo_signed_response_alg: String,
    // oidc defined variable name
    // eslint-disable-next-line @typescript-eslint/camelcase
    userinfo_encrypted_response_alg: String,
    // oidc defined variable name
    // eslint-disable-next-line @typescript-eslint/camelcase
    userinfo_encrypted_response_enc: String,
  },
  {
    // Mongoose add 's' at the end of the collection name without this argument
    collection: 'provider',
    strict: true,
    strictQuery: true,
  },
);
