/**
 * Centralize error codes for this module.
 *
 * Exception should set their code to one of this enum entry.
 * An entry should be used by one and only one exception.
 *
 * Codes are documented here:
 * @see ../../../../back/_doc/erreurs.md
 * @TODO #140 update the upper link to gitlab when page is migrated
 * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/140
 */
export enum ErrorCode {
  DISABLED_PROVIDER = 17,
  MISSING_PROVIDER = 19,
  MISSING_STATE = 21,
  INVALID_STATE = 22,
  TOKEN_FAILED = 26,
  USERINFOS_FAILED = 27,
  GET_END_SESSION_URL = 28,
  TOKEN_RESULT_FAILED = 30,
}
