import { IFederation } from './federation.interface';

export interface IAccount {
  createdAt: Date;
  updatedAt: Date;
  lastConnection: Date;
  identityHash: string;
  active: boolean;
  idpFederation: IFederation;
  spFederation: IFederation;
}
