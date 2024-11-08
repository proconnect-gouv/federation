/* istanbul ignore file */

// Declarative code

import { ErrorCode } from '../enums';
import { OidcProviderRenderedException } from './oidc-provider-rendered.exception';

export class OidcProviderGrantSaveException extends OidcProviderRenderedException {
  static CODE = ErrorCode.GRANT_NOT_SAVED;
  static DOCUMENTATION =
    'Problème de sauvegarde du grant. Contacter le support N3';
  static ERROR = 'server_error';
  static ERROR_DESCRIPTION =
    'authentication aborted due to a technical error on the authorization server';
  static UI = 'OidcProvider.exceptions.oidcProviderGrantSave';
}
