import { OidcProviderBaseRedirectException } from '@fc/oidc-provider/exceptions';

import { ErrorCode } from '../enums';

export class CoreLoginRequiredException extends OidcProviderBaseRedirectException {
  static CODE = ErrorCode.LOGIN_REQUIRED;
  static DOCUMENTATION = `Une authentification de l’utilisateur est nécessaire.`;
  static ERROR = 'login_required';
  static ERROR_DESCRIPTION = 'end-user authentication is required';
  static SCOPE = 3;
  static UI = 'Core.exceptions.coreLoginRequired';
}
