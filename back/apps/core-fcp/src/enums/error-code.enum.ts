/* istanbul ignore file */

// Declarative code
export enum ErrorCode {
  FAILED_ABORT_SESSION = 1,
  // To not colude with core exception, need to skip a lot of values
  INSUFFICIENT_ACR_LEVEL_SUSPICIOUS_REQUEST = 11,
  FETCH_DATA_PROVIDER_JWKS_FAILED = 12,
  MISSING_AT_HASH = 50,
}
