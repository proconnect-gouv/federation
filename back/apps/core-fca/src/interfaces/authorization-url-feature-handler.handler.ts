/* istanbul ignore file */

// Declarative code
import { OidcClientService } from '@fc/oidc-client';

export interface IAuthorizationUrlFeatureHandlerHandleArgument {
  oidcClient: OidcClientService;
  state: string;
  scope: string;
  idpId: string;
  idpFeatureHandlers: {
    [key: string]: string;
  };
  acr_values: string;
  nonce: string;
  spId;
}
