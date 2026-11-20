type BrowserState = { cookies: Cypress.Cookie[]; url: string };

// Each simulated browser keeps its cookies and its last page, which are
// restored when switching back to it
let currentBrowser: string | undefined;
let browserStates: Record<string, BrowserState> = {};

export const resetSimulatedBrowsers = (): void => {
  currentBrowser = undefined;
  browserStates = {};
};

const saveCurrentBrowserState = (): void => {
  if (!currentBrowser) return;
  const browser = currentBrowser;
  cy.getAllCookies().then((cookies) => {
    cy.url().then((url) => {
      browserStates[browser] = { cookies, url };
    });
  });
};

export const useSimulatedBrowser = (browser: string): void => {
  saveCurrentBrowserState();
  cy.clearAllCookies();
  cy.then(() => {
    currentBrowser = browser;
    const state = browserStates[browser];
    if (!state) return;
    state.cookies.forEach(
      ({ name, value, domain, path, secure, httpOnly, sameSite }) =>
        cy.setCookie(name, value, {
          domain,
          path,
          secure,
          httpOnly,
          sameSite,
        }),
    );
    // The last page may have been reached through a form, and fail when
    // visited again: the next steps navigate from there
    cy.visit(state.url, { failOnStatusCode: false });
  });
};
