export enum ErrorCode {
  MISSING_CONTEXT = 3,
  MISSING_IDENTITY = 4,
  /**
   * @todo #992 suppression de la librairie @fc/core
   * core-fcp specific error, to be moved when we remove @fc/core
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/992
   */
  FAILED_PERSISTENCE = 8,
  IDENTITY_PROVIDER_NOT_FOUND = 10,
  CORE_IDP_BLOCKED_FOR_ACCOUNT = 11,
  IDENTITY_CHECK_TOKEN = 13,
  IDP_HINT_NOT_FOUND = 16,
  MISSING_AT_HASH = 19,
}
