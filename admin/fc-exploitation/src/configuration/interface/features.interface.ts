import { IEnableMails } from './enable-mails.inerface';

export interface IFeatures {
  displayMessageOnLogin?: boolean;
  debugMode: boolean;
  enableMails: IEnableMails;
  nonceMandatory: boolean;
  accessTokenHeaderOnly: boolean;
  secureCookieFlag: boolean;
  convertToJsonIdentityFromCheckToken: boolean;
  globalAgentForHTTPS: boolean;
  displayConfirmationAfterAuthentication: boolean;
  // tslint:disable-next-line: variable-name
  acr_values: boolean;
  isFSUsingMouseFlow: any[];
  isWebsiteUsingMouseFlow: boolean;
  rnippIdentityCheck: boolean;
}
