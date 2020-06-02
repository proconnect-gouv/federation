import { OidcProviderBaseException } from './oidc-provider-base.exception';
import { ErrorCode } from '../enums';
import { errors as RuntimeErrors } from 'oidc-provider';

/**
 * Mapping between oidc-provider error classes
 * and some unique numbers to generate a specific public error code.
 *
 * We "sub scope" those errors code in 100 to 199.
 *
 * NB: map keys are number in strings
 * cause objects can't actually have integer keys.
 * Writting them down as int results in type inference
 * and might make developers believe keys are actual numbers
 */
const nativeErrorsMap = {
  '101': RuntimeErrors.AccessDenied,
  '102': RuntimeErrors.AuthorizationPending,
  '103': RuntimeErrors.ConsentRequired,
  '104': RuntimeErrors.ExpiredToken,
  '105': RuntimeErrors.InteractionRequired,
  '106': RuntimeErrors.InvalidClient,
  '107': RuntimeErrors.InvalidClientAuth,
  '108': RuntimeErrors.InvalidClientMetadata,
  '109': RuntimeErrors.InvalidGrant,
  /**
   * NB: `SessionNotFound` is derived from InvalidRequest
   *     so it must be placed before InvalidRequest
   */
  '110': RuntimeErrors.SessionNotFound,
  '111': RuntimeErrors.InvalidRequest,
  '112': RuntimeErrors.InvalidRequestUri,
  '113': RuntimeErrors.InvalidScope,
  '114': RuntimeErrors.InvalidSoftwareStatement,
  '115': RuntimeErrors.InvalidTarget,
  '116': RuntimeErrors.InvalidToken,
  '117': RuntimeErrors.LoginRequired,
  '118': RuntimeErrors.RedirectUriMismatch,
  '119': RuntimeErrors.RegistrationNotSupported,
  '120': RuntimeErrors.RequestNotSupported,
  '121': RuntimeErrors.RequestUriNotSupported,
  '122': RuntimeErrors.SlowDown,
  '123': RuntimeErrors.TemporarilyUnavailable,
  '124': RuntimeErrors.UnapprovedSoftwareStatement,
  '125': RuntimeErrors.UnauthorizedClient,
  '126': RuntimeErrors.UnsupportedGrantType,
  '127': RuntimeErrors.UnsupportedResponseMode,
  '128': RuntimeErrors.UnsupportedResponseType,
  '129': RuntimeErrors.WebMessageUriMismatch,
};
/**
 * Default error code for an error thrown by `oidc-provider`
 * but not listed above.
 */
const unknwonNativeErrorCode = 100;

export class OidcProviderRuntimeException extends OidcProviderBaseException {
  public readonly code: ErrorCode;

  constructor(error: Error, code?: ErrorCode) {
    super(error);

    // Deduce a code from mapping if error is a known `oidc-provider` error.
    if (error instanceof RuntimeErrors.OIDCProviderError) {
      this.code = this.getCodeFromError(error);
    }

    // If a code is explicitly provided override potentially deducted code.
    // Actually we should either provider a native error, either provide a code.
    if (code) {
      this.code = code;
    }

    // If still no code was deduced, apply the default code,
    if (!this.code) {
      this.code = ErrorCode.UNKNOWN;
    }
  }

  /**
   * Get error code for given error class.
   *
   * Return default error code if not in the mapping.
   * This could happen with future upgrade of the `oidc-provider` library,
   * in that case, we should update `nativeErrorsMap` accoringly.
   *
   * @param error
   */
  getCodeFromError(error: RuntimeErrors.OIDCProviderError): number {
    const entry = Object.entries(nativeErrorsMap).find(
      ([, Class]) => error instanceof Class,
    );

    if (entry) {
      const [code] = entry;
      return parseInt(code, 10);
    }

    return unknwonNativeErrorCode;
  }
}
