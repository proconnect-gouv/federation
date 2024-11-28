/**
 * Code generated from oidc-provider exceptions
 * @see @fc/oidc-provider/src/cli/scaffold-exceptions/run.sh
 */
import { OidcProviderBaseRuntimeException } from '../oidc-provider-base-runtime.exception';

export class OidcProviderRuntime_InvalidScope_1EAB_Exception extends OidcProviderBaseRuntimeException {
  static CODE = '1EAB';
  static ERROR_CLASS = 'InvalidScope';
  static ERROR_DETAIL = 'requested scope is not allowed, scope';
  static DOCUMENTATION = 'requested scope is not allowed, scope';
  static ERROR_SOURCE = 'actions/grants/client_credentials.js:26';
  static UI = 'OidcProvider.exceptions.InvalidScope.1EAB';
}
