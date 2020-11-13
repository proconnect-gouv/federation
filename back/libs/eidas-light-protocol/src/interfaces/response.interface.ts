import {
  LevelOfAssurance,
  StatusCode,
  SubjectNameIdFormat,
  SubStatusCode,
} from '../types';

export interface IResponseStatus {
  failure: string;
  statusCode?: StatusCode;
  statusMessage?: string;
  subStatusCode?: SubStatusCode;
}

export interface IResponseAddress {
  addressId?: string;
  adminunitFirstline?: string;
  adminunitSecondline?: string;
  cvaddressArea?: string;
  locatorDesignator?: string;
  locatorName?: string;
  poBox?: string;
  postCode?: string;
  postName?: string;
  thoroughfare?: string;
}

export interface IResponseAttributes {
  personIdentifier: string;
  currentFamilyName: string;
  currentGivenName: string;
  dateOfBirth: string;
  currentAddress?: IResponseAddress;
  gender?: string;
  birthName?: string[];
  placeOfBirth?: string;
}

export interface IResponseContext {
  id: string;
  relayState?: string;
  issuer: string;
  ipAddress?: string;
  subject: string;
  subjectNameIdFormat: SubjectNameIdFormat;
  inResponseToId: string;
  levelOfAssurance: LevelOfAssurance;
}

export interface IResponse extends IResponseContext {
  status: IResponseStatus;
  attributes?: IResponseAttributes;
}
