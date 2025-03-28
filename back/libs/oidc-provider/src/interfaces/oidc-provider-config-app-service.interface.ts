import { KoaContextWithOIDC, Provider } from 'oidc-provider';

import { UserSession } from '@fc/core-fca';

export interface IOidcProviderConfigAppService {
  logoutSource(ctx: KoaContextWithOIDC, form: string);
  postLogoutSuccessSource(ctx: KoaContextWithOIDC);
  findAccount(ctx: KoaContextWithOIDC, sessionId: string);
  finishInteraction(req: any, res: any, session: UserSession);
  setProvider(provider: Provider);
}
