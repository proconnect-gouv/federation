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
  INIT_PROVIDER = 2,
  RUNTIME = 3,
  BINDING_PROVIDER = 4,
  STRINGIFY_FOR_REDIS = 5,
  PARSE_REDIS_RESPONSE = 6,
}
