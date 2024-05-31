import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

import { addInterceptParams } from '../../common/helpers';
import { getDefaultIdpScope } from '../helpers';
import IdentityProviderSelectionPage from '../pages/identity-provider-selection-page';

const identityProviderSelectionPage = new IdentityProviderSelectionPage();

Then(
  "je suis redirigé vers la page sélection du fournisseur d'identité",
  function () {
    identityProviderSelectionPage.checkIsVisible();
  },
);

Then(
  /^le fournisseur d'identité (est|n'est pas) affiché dans la mire$/,
  function (text) {
    const isVisible = text === 'est';
    identityProviderSelectionPage
      .getIdpButton(this.identityProvider)
      .should(isVisible ? 'be.visible' : 'not.exist');
  },
);

Then(
  /^le fournisseur d'identité est (actif|désactivé) dans la mire$/,
  function (state) {
    const isEnabled = state === 'actif';
    identityProviderSelectionPage
      .getIdpButton(this.identityProvider)
      .should('be.visible')
      .should(isEnabled ? 'be.enabled' : 'be.disabled');
  },
);

Given(
  "je paramètre un intercepteur pour l'appel authorize au fournisseur d'identité",
  function () {
    const { url } = this.identityProvider;
    cy.intercept(`${url}/authorize*`).as('FI:Authorize');
  },
);

Given(
  'je mets le state fourni par FC dans le paramètre "state" de la requête',
  function () {
    cy.wait('@FI:Authorize')
      .its('request.query.state')
      .should('exist')
      .then((value: string) => {
        this.apiRequest.qs['state'] = value;
      });
  },
);

Given(
  "je paramètre un intercepteur pour retirer le scope {string} au prochain appel au fournisseur d'identité",
  function (scopeToRemove) {
    const { idpId, url } = this.identityProvider;
    // Use requested scope for eidas idp and default scope for other idp
    const scopeContext =
      idpId === 'eidas-bridge'
        ? this.requestedScope
        : getDefaultIdpScope(this.scopes);
    const { scopes } = scopeContext;
    const modifiedScope = scopes
      .filter((scope) => scope !== scopeToRemove)
      .join(' ');
    addInterceptParams(
      `${url}/authorize*`,
      { scope: modifiedScope },
      'FI:IdpRemoveScope',
    );
  },
);

Given(
  "je paramètre un intercepteur pour ajouter le scope {string} au prochain appel au fournisseur d'identité",
  function (scopeToAdd) {
    const { idpId, url } = this.identityProvider;
    // Use requested scope for eidas idp and default scope for other idp
    const scopeContext =
      idpId === 'eidas-bridge'
        ? this.requestedScope
        : getDefaultIdpScope(this.scopes);
    const { scopes } = scopeContext;
    const modifiedScope = [...scopes, scopeToAdd].join(' ');
    addInterceptParams(
      `${url}/authorize*`,
      { scope: modifiedScope },
      'FI:IdpAddScope',
    );
  },
);

Given(
  "je paramètre un intercepteur pour forcer un mauvais client_id au prochain appel au fournisseur d'identité",
  function () {
    const { url } = this.identityProvider;
    addInterceptParams(
      `${url}/authorize*`,
      { client_id: 'wrong_client_id' },
      'FI:ClientIdModified',
    );
  },
);

When("je clique sur le fournisseur d'identité", function () {
  expect(this.identityProvider).to.exist;
  identityProviderSelectionPage
    .getIdpButton(this.identityProvider)
    .click({ force: true });
});

When('je clique sur le lien retour vers le FS sous la mire', function () {
  identityProviderSelectionPage.getBackToServiceProviderLink().click();
});

When("je force l'utilisation du fournisseur d'identité", function () {
  expect(this.identityProvider).to.exist;
  identityProviderSelectionPage
    .getIdpButton(this.identityProvider)
    // Remove the disabled attribute
    .invoke('attr', 'disabled', false)
    .click({ force: true });
});

When(
  "je force l'utilisation d'un fournisseur d'identité inexistant",
  function () {
    expect(this.identityProvider).to.exist;
    identityProviderSelectionPage.modifyProviderUidOfIdpButton(
      this.identityProvider,
      'unknown-idp-uid',
    );
    identityProviderSelectionPage.getIdpButton(this.identityProvider).click();
  },
);

When(
  "je force l'utilisation d'un fournisseur d'identité avec un csrf non valide",
  function () {
    expect(this.identityProvider).to.exist;
    identityProviderSelectionPage.modifyCsrfOfIdpButton(
      this.identityProvider,
      'invalid-csrf',
    );
    identityProviderSelectionPage.getIdpButton(this.identityProvider).click();
  },
);

Then(
  /^le fournisseur d'identité (est|n'est pas) désactivé dans la liste$/,
  function (text) {
    const isDisabled = text === 'est';
    identityProviderSelectionPage
      .getIdpButton(this.identityProvider)
      .should(isDisabled ? 'be.disabled' : 'be.enabled');
  },
);

Then(
  /^le bouton Aidants Connect (est|n'est pas) affiché sous la mire$/,
  function (text: string) {
    const isVisible = text === 'est';
    identityProviderSelectionPage
      .getAidantsConnectButton()
      .should(isVisible ? 'be.visible' : 'not.exist');
  },
);

Then(
  /^le bouton Aidants Connect (est|n'est pas) actif$/,
  function (text: string) {
    const isEnabled = text === 'est';
    identityProviderSelectionPage
      .getAidantsConnectButton()
      .should(isEnabled ? 'be.enabled' : 'be.disabled');
  },
);

When('je clique sur le bouton Aidants Connect', function () {
  identityProviderSelectionPage.getAidantsConnectButton().click();
});

Then(
  /^la modale "sélection FI" (est|n'est pas) présente sur la mire$/,
  function (text: string) {
    const isVisible = text === 'est';
    const { idpId } = this.identityProvider;
    identityProviderSelectionPage
      .getIdpSelectionModal(idpId)
      .getModal()
      .should(isVisible ? 'be.visible' : 'not.be.visible');
  },
);

When(
  'je clique sur le bouton continuer de la modale "sélection FI"',
  function () {
    const { idpId } = this.identityProvider;
    identityProviderSelectionPage
      .getIdpSelectionModal(idpId)
      .getContinueButton()
      .click();
  },
);

When(
  'je clique sur le bouton annuler de la modale "sélection FI"',
  function () {
    const { idpId } = this.identityProvider;
    identityProviderSelectionPage
      .getIdpSelectionModal(idpId)
      .getCancelButton()
      .click();
  },
);

When('je clique sur le bouton fermer de la modale "sélection FI"', function () {
  const { idpId } = this.identityProvider;
  identityProviderSelectionPage
    .getIdpSelectionModal(idpId)
    .getCloseButton()
    .click();
});
