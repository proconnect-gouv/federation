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

export function interactionCookieHeader(interactionId: string): string {
  return signOidcProviderCookie("_interaction", interactionId);
}

type CookieResponse = { get(header: "Set-Cookie"): string[] | undefined };

/**
 * Extracts a real "name=value" pair from a response's Set-Cookie
 * header - the LAST match, since Set-Cookie can carry a stale clearing
 * entry ("name=; Expires=1970...") before the real one (real browser
 * semantics: later Set-Cookie for the same name wins).
 */
export function responseCookie(response: CookieResponse, name: string): string {
  const headers = (response.get("Set-Cookie") ?? []).filter((c) =>
    c.startsWith(`${name}=`),
  );
  const header = headers.at(-1);
  if (!header) throw new Error(`Expected a ${name} cookie on the response`);
  return header.split(";")[0];
}

/**
 * oidc-provider signs its own cookies (Koa's `cookies` package) as a
 * value+signature PAIR of separate cookies, not one signed value. Use
 * on a REAL response from a real oidc-provider request (e.g. a real
 * GET /authorize) - for faking this cookie without one, use
 * signOidcProviderCookie()/interactionCookieHeader() instead.
 */
export function oidcProviderResponseCookie(
  response: CookieResponse,
  name: string,
): string {
  return `${responseCookie(response, name)}; ${responseCookie(response, `${name}.sig`)}`;
}
