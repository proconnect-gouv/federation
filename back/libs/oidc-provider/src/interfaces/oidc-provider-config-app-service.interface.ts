import { KoaContextWithOIDC, Provider } from 'oidc-provider';

import { Session } from '@fc/session';

export interface IOidcProviderConfigAppService {
  logoutSource(ctx: KoaContextWithOIDC, form: string);
  postLogoutSuccessSource(ctx: KoaContextWithOIDC);
  findAccount(ctx: KoaContextWithOIDC, sessionId: string);
  finishInteraction(req: any, res: any, session: Session);
  setProvider(provider: Provider);
}
