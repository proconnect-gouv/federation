/* istanbul ignore file */

// Declarative code
/**
 * Centralize error codes for this module.
 *
 * Exception should set their code to one of this enum entry.
 * An entry should be used by one and only one exception.
 *
 * Codes are documented here:
 * @see https://confluence.kaliop.net/display/FC/Codes+erreurs+des+applications
 * @TODO #140 update the upper link to gitlab when page is migrated
 * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/140
 */
export enum ErrorCode {
  DISABLED_PROVIDER = 17,
  MISSING_PROVIDER = 19,
}
