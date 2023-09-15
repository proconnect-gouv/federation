/* istanbul ignore file */

import { IOidcIdentity } from '@fc/oidc';

// Declarative code
/**
 * @see https://openid.net/specs/openid-connect-core-1_0.html#rfc.section.5.1
 */
export interface IAgentConnectOidcIdentity extends IOidcIdentity {
  // external defined variable name
  // eslint-disable-next-line @typescript-eslint/naming-convention
  is_service_public?: boolean;
}
