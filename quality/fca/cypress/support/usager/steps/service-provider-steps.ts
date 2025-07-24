import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

import {
  checkExpectedUserClaims,
  checkFCBasicAuthorization,
  checkMandatoryData,
  checkNoExtraClaims,
  getIdentityProviderByDescription,
  getScopeByDescription,
  getServiceProviderByDescription,
  getUserInfoProperty,
  getUserInfoSignatureAlgorithmByDescription,
  isUsingFCBasicAuthorization,
  removeCodeChallengeMethod,
  removeFromRequestedClaims,
  removePrompt,
  setAcrValues,
  setAsRequestedClaims,
  setAsVoluntaryClaims,
  setCodeChallengeMethod,
  setIdpHint,
  setLoginHint,
  setPrompt,
  setScope,
} from '../../common/helpers';

When('je navigue sur la page fournisseur de service', function () {
  const serviceProvider = getServiceProviderByDescription('par défaut');
  cy.visit(serviceProvider.url);
});

When(
  /je navigue sur la page fournisseur de service "([^"]+)"/,
  function (description: string) {
    const serviceProvider = getServiceProviderByDescription(description);
    cy.visit(serviceProvider.url);
  },
);

Given(
  'le fournisseur de service demande le claim {string}',
  function (claim: string) {
    setAsVoluntaryClaims(claim);
  },
);

Given(
  'le fournisseur de service requiert le claim {string}',
  function (claim: string) {
    setAsRequestedClaims(claim);
  },
);

Given(
  'le fournisseur de service requiert le login_hint {string}',
  function (login_hint: string) {
    setLoginHint(login_hint);
  },
);

Given(
  'le fournisseur de service ne requiert pas le claim {string}',
  function (claim: string) {
    removeFromRequestedClaims(claim);
  },
);

Given(
  'le fournisseur de service demande un niveau de sécurité {string} via acr_values',
  function (acrValue: string) {
    setAcrValues(acrValue);
  },
);

Given(
  'le fournisseur de service requiert un niveau de sécurité {string}',
  function (acrValue: string) {
    setAsRequestedClaims('acr', acrValue);
  },
);

Given(
  /^le fournisseur de service requiert l'accès aux informations (?:du|des) scopes? "([^"]+)"$/,
  function (description: string) {
    setScope(getScopeByDescription(description));
  },
);

When('je clique sur le bouton ProConnect', function () {
  cy.get('button#custom-connection').click({ force: true });

  if (isUsingFCBasicAuthorization()) {
    checkFCBasicAuthorization();
  }
});

When('je clique sur le bouton ProConnect PKCE', function () {
  cy.get('button#login-pkce').click({ force: true });

  if (isUsingFCBasicAuthorization()) {
    checkFCBasicAuthorization();
  }
});

When('je clique sur le bouton de déconnexion', function () {
  cy.get('[action="/logout"] button').click();
});

Then(
  /je suis redirigé vers la page fournisseur de service "([^"]+)"/,
  function (description: string) {
    const serviceProvider = getServiceProviderByDescription(description);
    cy.url().should('include', serviceProvider.url);
  },
);

Then('je suis connecté au fournisseur de service', function () {
  cy.contains('Information utilisateur');
});

Then('je suis déconnecté du fournisseur de service', function () {
  // I am on the sp page
  cy.contains('Se connecter');
  // the userinfo section is not displayed as I am disconnected
  cy.contains('Information utilisateur').should('not.exist');
});

Then(
  /le fournisseur de service "([^"]+)" a accès aux informations (?:du|des) scopes? "([^"]+)" en provenance du FI "([^"]+)"/,
  function (
    spDescription: string,
    scopeDescription: string,
    idpDescription: string,
  ) {
    const userInfoSignatureAlgorithm =
      getUserInfoSignatureAlgorithmByDescription(spDescription);
    checkMandatoryData(userInfoSignatureAlgorithm !== null);

    const idpClaims = {
      idp_acr: 'eidas1',
      idp_id: getIdentityProviderByDescription(idpDescription).id,
    };

    checkExpectedUserClaims(scopeDescription, idpClaims);
    checkNoExtraClaims(scopeDescription, userInfoSignatureAlgorithm !== null);
  },
);

Then(
  'la cinématique a utilisé le niveau de sécurité {string}',
  function (acrValue: string) {
    cy.contains(`"acr": "${acrValue}"`);
  },
);

Then(
  'la cinématique a renvoyé le claim {string}',
  function (claimName: string) {
    cy.contains(new RegExp('  "' + claimName + '": ".*",', 'g'));
  },
);

Then("la cinématique a renvoyé l'amr {string}", function (amrValue: string) {
  cy.contains(`"amr": [\n    "${amrValue}"\n  ],`);
});

Then("la cinématique n'a pas renvoyé d'amr", function () {
  cy.contains('"amr": "').should('not.exist');
});

Then(
  'je suis redirigé vers la page erreur du fournisseur de service',
  function () {
    cy.url().should('include', '/oidc-callback?error=');
  },
);

Then(
  "le titre de l'erreur fournisseur de service est {string}",
  function (errorCode: string) {
    cy.url().should('include', `error=${errorCode}`);
  },
);

Then(
  "la description de l'erreur fournisseur de service est {string}",
  function (errorDescription: string) {
    cy.url().should('include', `error_description=${errorDescription}`);
  },
);

Given('je mémorise le sub envoyé au fournisseur de service', function () {
  getUserInfoProperty('sub').as('spSub');
});

Then(
  /^le sub transmis au fournisseur de service est (identique|différent) [ad]u sub mémorisé$/,
  function (text: string) {
    const comparison = text === 'identique' ? 'be.equal' : 'not.be.equal';

    cy.get<string>('@spSub').then((previousSpSub) => {
      getUserInfoProperty('sub').should(comparison, previousSpSub);
    });
  },
);

Then(
  'le sub transmis au fournisseur de service est le suivant {string}',
  function (sub: string) {
    getUserInfoProperty('sub').should('be.equal', sub);
  },
);

Then(
  "le sub transmis au fournisseur de service n'est pas le suivant {string}",
  function (sub: string) {
    getUserInfoProperty('sub').should('not.be.equal', sub);
  },
);

Then(
  'le siret transmis au fournisseur de service est le suivant {string}',
  function (siret: string) {
    getUserInfoProperty('siret').should('be.equal', siret);
  },
);

Given(
  /je rentre un id qui ne correspond à aucun fournisseur d'identité dans le champ idp_hint/,
  function () {
    setIdpHint('not-an-idp-id');
  },
);

Given(
  /je rentre l'id du fournisseur d'identité "([^"]+)" dans le champ idp_hint/,
  function (idpDescription: string) {
    const { id: idpId } = getIdentityProviderByDescription(idpDescription);
    setIdpHint(idpId);
  },
);

Given('je rentre {string} dans le champ prompt', function (prompt: string) {
  if (prompt === 'disabled') {
    removePrompt();
    return;
  }

  setPrompt(prompt);
});

When('je révoque le token ProConnect', function () {
  cy.get('#revoke-token').click();
});

Then('le token ProConnect est révoqué', function () {
  // I am on the sp page
  cy.contains('Se connecter');
});

When("je redemande les informations de l'usager", function () {
  cy.get('#fetch-userinfo').click();
});

Then(/je vois l'erreur "([^"]+)"/, function (errorMessage: string) {
  cy.contains(errorMessage);
});

When(
  "le fournisseur de service demande l'accès aux données au fournisseur de données",
  function () {
    cy.get('#fetch-userdata').click();
  },
);

Then(
  "le fournisseur de données vérifie l'access token fourni par le fournisseur de service",
  function () {
    cy.get('#userdata')
      .invoke('text')
      .should('be.ok')
      .then((tokenText) => {
        const token = JSON.parse(tokenText)[0].response;
        cy.wrap(token).as('tokenIntrospection');
      });
  },
);

Given(
  /je paramètre un intercepteur pour l'appel à la redirect_uri du fournisseur de service "([^"]+)"/,
  function (description: string) {
    const { url } = getServiceProviderByDescription(description);
    cy.intercept(`${url}/oidc-callback*`, (req) => {
      req.reply({
        body: '<h1>Intercepted request</h1>',
      });
    }).as('FS:OidcCallback');
  },
);

Given(
  'je mets le code renvoyé par PC au FS dans la propriété "code" du corps de la requête',
  function () {
    cy.wait('@FS:OidcCallback')
      .its('request.query.code')
      .should('exist')
      .then((value: string) => {
        this.apiRequest.body['code'] = value;
      });
  },
);

Given(
  'le fournisseur de service ne fournit pas le paramètre code_challenge_method',
  function () {
    removeCodeChallengeMethod();
  },
);

Given(
  'le fournisseur de service utilise le paramètre code_challenge_method {string}',
  function (codeChallengeMethod: string) {
    setCodeChallengeMethod(codeChallengeMethod);
  },
);
