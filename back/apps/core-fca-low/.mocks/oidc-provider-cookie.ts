import Keygrip from "keygrip";

import TEST_CONFIG from "./config";

/**
 * oidc-provider signs its own cookies (`cookies.long/short.signed: true`
 * in OidcProvider config) via Koa's `cookies` package + keygrip, separate
 * from this app's own SessionService signing.
 * @see node_modules/cookies/index.js (Cookies.prototype.set)
 */
export function signOidcProviderCookie(name: string, value: string): string {
  const keygrip = new Keygrip(
    TEST_CONFIG.OidcProvider.cookies.keys as string[],
  );
  const signature = keygrip.sign(`${name}=${value}`);

  return `${name}=${value}; ${name}.sig=${signature}`;
}
