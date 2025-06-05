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
  UNKNOWN = 0,
  INIT_PROVIDER = 2,
  BINDING_PROVIDER = 4,
  STRINGIFY_FOR_REDIS = 5,
  PARSE_REDIS_RESPONSE = 6,
  AUTHORIZATION_ERROR = 7,
  INTERACTION_NOT_FOUND = 25,
  PARSE_JSON_CLAIMS = 28,
  RUNTIME_ERROR = 29,
  USER_ABORTED = 30,
  NO_WRAPPER = 31,
}
