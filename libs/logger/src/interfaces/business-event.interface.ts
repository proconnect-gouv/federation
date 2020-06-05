/**
 * ⚠️ Warning ⚠️
 *
 * Properties should not be modified lightly
 *
 *  - Hazard of log pollution
 *  - Hazard of (personal) data leak
 *  - Hazard of breaking tools reading the logs
 *
 * @TODO #123 log more informations:
 * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/123
 *
 * spScope: string;
 * fcClaims?: string;
 * accountId?: string;
 */
export interface IBusinessEvent {
  // Global cinematic id (created by `oidc-provider`)
  interactionId: string;

  // Client ip address
  ip: string;

  // Event properties
  step: string;
  category: string;
  event: string;

  // Service Provider informations
  spId: string;
  spName: string;
  spAcr: string;

  // Identity Provider informations
  idpId?: string;
  idpName?: string;
  idpAcr?: string;
}
