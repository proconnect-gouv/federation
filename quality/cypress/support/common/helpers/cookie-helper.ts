const FC_SESSION_COOKIE = "pc_session_id";

export const getCookieFromUrl = (
  cookieName: string,
  cookieUrl: string,
): Cypress.Chainable<Cypress.Cookie> => {
  const url = new URL(cookieUrl);
  const domain = url.hostname;
  return cy.getCookie(cookieName, { domain });
};

export const setUnknowSessionIdInSessionCookie = (cookieUrl: string): void => {
  const url = new URL(cookieUrl);
  const domain = url.hostname;
  const cookieValue =
    "s%3Aaaaaaa559244e12db08e445edfb6fc39e20055a03f3e3618d3f18d907055276a94d2146dc999ab8c07bd45120f93fa03c8c2e30cb4497a349f299bb4384d7449.x5K8E3fK00eFl1yRIlvArTJQd373CHg7yQ7h1ZEsoKw";
  const cookieOptions: Partial<Cypress.SetCookieOptions> = {
    domain: `.${domain}`,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: true,
  };
  cy.setCookie(FC_SESSION_COOKIE, cookieValue, cookieOptions);
};
