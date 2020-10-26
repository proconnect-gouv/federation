/**
 * Centralize error codes for this module.
 *
 * Exception should set their code to one of this enum entry.
 * An entry should be used by one and only one exception.
 *
 * Codes are documented here:
 * @TODO add the link to where errors are documented
 */
export const enum ErrorCode {
  JSON_COULD_NOT_BE_CONVERTED = 3,
  XML_COULD_NOT_BE_CONVERTED = 4,
}
