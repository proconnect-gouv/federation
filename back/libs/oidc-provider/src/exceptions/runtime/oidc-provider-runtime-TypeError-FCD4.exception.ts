/**
 * Code generated from oidc-provider exceptions
 * @see @fc/oidc-provider/src/cli/scaffold-exceptions/run.sh
 */
import { OidcProviderBaseRuntimeException } from '../oidc-provider-base-runtime.exception';

export class OidcProviderRuntime_TypeError_FCD4_Exception extends OidcProviderBaseRuntimeException {
  static CODE = 'FCD4';
  static ERROR_CLASS = 'TypeError';
  static ERROR_DETAIL =
    'persist can only be called on previously persisted Sessions';
  static DOCUMENTATION =
    'persist can only be called on previously persisted Sessions';
  static ERROR_SOURCE = 'models/session.js:109';
  static UI = 'OidcProvider.exceptions.TypeError.FCD4';
}
