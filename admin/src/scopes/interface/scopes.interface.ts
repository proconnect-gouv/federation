import { ObjectId } from 'typeorm';

export interface IScopes {
  id: ObjectId;
  scope: string;
  fd: string;
  label: string;
}
