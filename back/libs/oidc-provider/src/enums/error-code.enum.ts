/**
 * Centralize error codes for this module.
 *
 * Exception should set their code to one of this enum entry.
 * An entry should be used by one and only one exception.
 *
 * Codes are documented here:
 * @see ../../../../back/_doc/erreurs.md
 */
export enum ErrorCode {
  INIT_PROVIDER = 2,
  BINDING_PROVIDER = 4,
  STRINGIFY_FOR_REDIS = 5,
  PARSE_REDIS_RESPONSE = 6,
  MISSING_AT_HASH = 19,
  RUNTIME_ERROR = 29,
  NO_WRAPPER = 31,
}
