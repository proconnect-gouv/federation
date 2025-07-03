import { ObjectID } from 'typeorm';

export interface IScopes {
  id: ObjectID;
  scope: string;
  fd: string;
  label: string;
}
