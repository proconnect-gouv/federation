import * as mongoose from 'mongoose';

export const IdentityProviderSchema = new mongoose.Schema(
  {
    name: String,
    clientID: String,
    // oidc defined variable name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    client_secret: String,
    discoveryUrl: String,
    // oidc defined variable name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    redirect_uris: [String],
    // oidc defined variable name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    response_types: [String],
    // oidc defined variable name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    id_token_signed_response_alg: String,
    // oidc defined variable name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    token_endpoint_auth_method: String,
    // oidc defined variable name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    id_token_encrypted_response_alg: String,
    // oidc defined variable name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    id_token_encrypted_response_enc: String,
    // oidc defined variable name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    userinfo_signed_response_alg: String,
    // oidc defined variable name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    userinfo_encrypted_response_alg: String,
    // oidc defined variable name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    userinfo_encrypted_response_enc: String,
  },
  {
    // Mongoose add 's' at the end of the collection name without this argument
    collection: 'provider',
    strict: true,
    strictQuery: true,
  },
);
