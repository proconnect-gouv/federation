export enum ErrorCode {
  LOW_ACR = 1,
  INVALID_ACR = 2,
  MISSING_CONTEXT = 3,
  MISSING_IDENTITY = 4,
  INVALID_CSRF = 5,
  MISSING_AUTHENTICATION_EMAIL = 6,
  INVALID_IDENTITY = 7,
  /**
   * @todo core-fcp specific error, to be moved when we remove @fc/core
   */
  INVALID_CONSENT_PROCESS = 8,
}
