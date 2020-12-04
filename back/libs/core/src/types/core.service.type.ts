/* istanbul ignore file */

// Declarative code

import { IOidcIdentity } from '@fc/oidc';

export type IdentityGroup = { idpId: string; idpIdentity: IOidcIdentity };
export type ServiceGroup = {
  spIdentity: IOidcIdentity;
  spId: string;
  spRef: string;
};
