import * as mongoose from 'mongoose';

export const ServiceProviderSchema = new mongoose.Schema(
  {
    active: Boolean,
    key: String,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    client_secret: String,
    scopes: [String],
    // eslint-disable-next-line @typescript-eslint/naming-convention
    redirect_uris: [String],
    // openid defined property names
    // eslint-disable-next-line @typescript-eslint/naming-convention
    id_token_signed_response_alg: String,
    // openid defined property names
    // eslint-disable-next-line @typescript-eslint/naming-convention
    id_token_encrypted_response_alg: String,
    // openid defined property names
    // eslint-disable-next-line @typescript-eslint/naming-convention
    id_token_encrypted_response_enc: String,
    // openid defined property names
    // eslint-disable-next-line @typescript-eslint/naming-convention
    userinfo_signed_response_alg: String,
    // openid defined property names
    // eslint-disable-next-line @typescript-eslint/naming-convention
    userinfo_encrypted_response_alg: String,
    // openid defined property names
    // eslint-disable-next-line @typescript-eslint/naming-convention
    userinfo_encrypted_response_enc: String,
    // openid defined property names
    // eslint-disable-next-line @typescript-eslint/naming-convention
    jwks_uri: String,
  },
  {
    // Mongoose add 's' at the end of the collection name without this argument
    collection: 'client',
    strict: true,
    strictQuery: true,
  },
);
