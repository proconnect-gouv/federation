/**
 * Code generated from oidc-provider exceptions
 * @see @fc/oidc-provider/src/cli/scaffold-exceptions/run.sh
 */
import { OidcProviderBaseRuntimeException } from '../oidc-provider-base-runtime.exception';

export class OidcProviderRuntime_InvalidClientAuth_91A3_Exception extends OidcProviderBaseRuntimeException {
  static CODE = '91A3';
  static ERROR_CLASS = 'InvalidClientAuth';
  static ERROR_DETAIL = 'unregistered client certificate provided';
  static DOCUMENTATION = 'unregistered client certificate provided';
  static ERROR_SOURCE = 'shared/token_auth.js:248';
  static UI = 'OidcProvider.exceptions.InvalidClientAuth.91A3';
}
