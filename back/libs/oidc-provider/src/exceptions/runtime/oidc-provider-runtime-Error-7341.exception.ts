/* istanbul ignore file */

/**
 * Code generated from oidc-provider exceptions
 * @see @fc/oidc-provider/src/cli/scaffold-exceptions/run.sh
 */
import { OidcProviderBaseRuntimeException } from '../oidc-provider-base-runtime.exception';

export class OidcProviderRuntime_Error_7341_Exception extends OidcProviderBaseRuntimeException {
  static CODE = '7341';
  static ERROR_CLASS = 'Error';
  static ERROR_DETAIL =
    'jwt.encrypt.key Resource Server configuration must be a secret (symmetric) or a public key';
  static DOCUMENTATION =
    'jwt.encrypt.key Resource Server configuration must be a secret (symmetric) or a public key';
  static ERROR_SOURCE = 'models/formats/jwt.js:81';
  static UI = 'OidcProvider.exceptions.Error.7341';
}
