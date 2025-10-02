import { ObjectId } from 'mongodb';

export interface IScopes {
  _id: ObjectId;
  scope: string;
  fd: string;
  label: string;
}
