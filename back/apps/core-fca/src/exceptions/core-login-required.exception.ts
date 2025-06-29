import { OidcProviderBaseRedirectException } from '@fc/oidc-provider/exceptions';

import { ErrorCode } from '../enums';

export class CoreLoginRequiredException extends OidcProviderBaseRedirectException {
  public code = ErrorCode.LOGIN_REQUIRED;
  public documentation = `Une authentification de l’utilisateur est nécessaire.`;
  static ERROR = 'login_required';
  static ERROR_DESCRIPTION = 'end-user authentication is required';
  public scope = 3;
  public ui = 'Core.exceptions.coreLoginRequired';
}
