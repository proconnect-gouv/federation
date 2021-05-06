import { ChainableElement, Scope } from '../../common/types';

/* eslint-disable @typescript-eslint/naming-convention */
// openid defined property names
const IDENTITY_SCOPES_LABEL = {
  address: `Adresse postale`,
  birthcountry: `Pays de naissance`,
  birthdate: `Date de naissance`,
  birthplace: `Lieu de naissance`,
  email: `Adresse email`,
  family_name: `Nom(s) de famille`,
  gender: `Sexe`,
  given_name: `Prénom(s)`,
  phone: `Téléphone`,
  preferred_username: `Nom d'usage`,
};
/* eslint-enable @typescript-eslint/naming-convention */

export default class InfoConsentPage {
  get consentButton(): ChainableElement {
    return cy.get('#consent');
  }

  get showDetailsToggle(): ChainableElement {
    return cy.get('#toggleOpenCloseMenu');
  }

  checkIsVisible(): void {
    cy.url().should('match', /\/api\/v2\/interaction\/[0-9a-z_-]+\/consent/i);
  }

  checkAnonymousScope(): void {
    cy.get('.section__identity').contains(
      'Vous avez été connecté de façon anonyme',
    );
    cy.get('.section__more-info').contains(
      "Aucune donnée n'a été échangée pour vous connecter.",
    );
  }

  checkInformationConsent(scope: Scope): void {
    const { attributes } = scope;
    this.showDetailsToggle.click();
    attributes
      .filter((scope) => scope in IDENTITY_SCOPES_LABEL)
      .forEach((scope) =>
        cy.contains(IDENTITY_SCOPES_LABEL[scope]).should('exist'),
      );
  }
}
