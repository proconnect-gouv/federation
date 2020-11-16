import { IOidcIdentity } from '@fc/oidc';

export interface IPatchSession {
  /** Service provider informations */
  spId?: string;
  spAcr?: string;
  spName?: string;
  /** identity FOR service provider */
  spIdentity?: IOidcIdentity;

  /** Identity provider informations */
  idpState?: string;
  idpId?: string;
  idpAcr?: string;
  idpName?: string;
  /** identitty FROM identity provider */
  idpIdentity?: IOidcIdentity;
  idpPrivileges?: Array<string>;

  csrfToken?: string;
}
