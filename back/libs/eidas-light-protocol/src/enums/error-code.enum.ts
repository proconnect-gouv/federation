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
  JSON_TO_XML_EXCEPTION = 1,
  XML_TO_JSON_EXCEPTION = 2,
  OVERSIZED_TOKEN_EXCEPTION = 3,
  INVALID_TOKEN_CHECKSUM_EXCEPTION = 4,
}
