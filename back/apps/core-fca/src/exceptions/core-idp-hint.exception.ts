import { OidcProviderBaseRedirectException } from '@fc/oidc-provider/exceptions';

import { ErrorCode } from '../enums';

export class CoreIdpHintException extends OidcProviderBaseRedirectException {
  public code = ErrorCode.IDP_HINT_NOT_FOUND;
  public documentation = `Une valeur (id de FI) invalide a été passée dans idp_hint. L'identifiant doit impérativement être l'identifiant d'un FI existant, contacter support N3`;
  public error = 'idp_hint_not_found';
  public error_description = 'provided idp_hint could not be found';
  public scope = 3;
  public ui = 'Core.exceptions.coreIdpHint';
}
