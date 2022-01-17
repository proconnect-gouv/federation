/* istanbul ignore file */

import { KoaContextWithOIDC } from 'oidc-provider';

// Declarative code
export interface IOidcProviderConfigAppService {
  logoutSource(ctx: KoaContextWithOIDC, form: string);
  postLogoutSuccessSource(ctx: KoaContextWithOIDC);
}
