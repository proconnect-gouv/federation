/**
 * Code generated from oidc-provider exceptions
 * @see @fc/oidc-provider/src/cli/scaffold-exceptions/run.sh
 */
import { OidcProviderBaseRuntimeException } from '../oidc-provider-base-runtime.exception';

export class OidcProviderRuntime_UnknownUserId_CE1A_Exception extends OidcProviderBaseRuntimeException {
  static CODE = 'CE1A';
  static ERROR_CLASS = 'UnknownUserId';
  static ERROR_DETAIL = 'could not identify end-user';
  static DOCUMENTATION = 'could not identify end-user';
  static ERROR_SOURCE = 'actions/authorization/ciba_load_account.js:50';
  static UI = 'OidcProvider.exceptions.UnknownUserId.CE1A';
}
