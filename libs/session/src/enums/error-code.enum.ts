/**
 * Centralize error codes for this module.
 *
 * Exception should set their code to one of this enum entry.
 * An entry should be used by one and only one exception.
 *
 * Codes are documented here:
 * @see https://confluence.kaliop.net/display/FC/Codes+erreurs+des+applications
 */
export const enum ErrorCode {
  NOT_FOUND = 1,
  BAD_FORMAT = 2,
  NO_SESSION_COOKIE = 3,
  NO_INTERACTION_COOKIE = 4,
  BAD_SESSION_ID = 5,
}
