import { OidcProviderBaseRedirectException } from '@fc/oidc-provider/exceptions';

import { ErrorCode } from '../enums';

export class CoreAcrNotSatisfiedException extends OidcProviderBaseRedirectException {
  public code = ErrorCode.ACR_NOT_SATISFIED;
  public documentation = `Le niveau ACR demandé par le fournisseur de service ne peut pas être satisfait.`;
  public error = 'access_denied';
  public error_description = 'requested ACRs could not be satisfied';
  public scope = 3;
  public ui = 'Core.exceptions.coreAcrNotSatisfied';
}
