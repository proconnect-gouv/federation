import { Document } from 'mongoose';

export interface ISpManagement extends Document {
  key: string;
  secret_hash: string;
  redirect_uris: [string];
}
