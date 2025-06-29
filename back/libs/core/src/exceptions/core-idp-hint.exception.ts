import { OidcProviderBaseRedirectException } from '@fc/oidc-provider/exceptions';

import { ErrorCode } from '../enums';

export class CoreIdpHintException extends OidcProviderBaseRedirectException {
  public code = ErrorCode.IDP_HINT_NOT_FOUND;
  public documentation = `Une valeur (id de FI) invalide a été passée dans idp_hint. L'identifiant doit impérativement être l'identifiant d'un FI existant, contacter support N3`;
  static ERROR = 'idp_hint_not_found';
  static ERROR_DESCRIPTION = 'provided idp_hint could not be found';
  static SCOPE = 3;
  static UI = 'Core.exceptions.coreIdpHint';
}
