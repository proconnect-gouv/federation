import { OidcProviderBaseRedirectException } from '@fc/oidc-provider/exceptions';

import { ErrorCode } from '../enums';

export class CoreAcrNotSatisfiedException extends OidcProviderBaseRedirectException {
  public code = ErrorCode.ACR_NOT_SATISFIED;
  public documentation = `Le niveau ACR demandé par le fournisseur de service ne peut pas être satisfait.`;
  static ERROR = 'access_denied';
  static ERROR_DESCRIPTION = 'requested ACRs could not be satisfied';
  static SCOPE = 3;
  static UI = 'Core.exceptions.coreAcrNotSatisfied';
}
