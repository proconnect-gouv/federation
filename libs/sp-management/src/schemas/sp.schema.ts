import * as mongoose from 'mongoose';

export const SpManagementSchema = new mongoose.Schema(
  {
    key: String,
    // eslint-disable-next-line @typescript-eslint/camelcase
    secret_hash: String,
    // eslint-disable-next-line @typescript-eslint/camelcase
    redirect_uris: [String],
  },
  {
    // Mongoose add 's' at the end of the collection name without this argument
    collection: 'client',
    strict: true,
    strictQuery: true,
  },
);
