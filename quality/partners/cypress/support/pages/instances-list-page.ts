import { ChainableElement } from '../types';
import InstanceCard from './instances-card';

export default class InstancesListPage {
  getConfirmationMessageTitle(): ChainableElement {
    return cy.get('.fr-alert__title');
  }

  getConfirmationMessageCloseButton(): ChainableElement {
    return cy.get('.fr-alert .fr-link--close');
  }

  getCreateInstanceTile(): ChainableElement {
    return cy.contains('.fr-tile a', 'Créer une instance de test');
  }

  getAddInstanceLink(): ChainableElement {
    return cy.get('a.fr-icon-add-line');
  }

  getAllInstanceCards(): ChainableElement {
    return cy.get('div.fr-card');
  }

  // Index starting with 0
  getInstanceCard(index: number): InstanceCard {
    return new InstanceCard(index);
  }

  checkIsVisible(): void {
    cy.contains('h1', 'Mon Bac à Sable').should('be.visible');
  }

  checkIsInstanceCreationConfirmationVisible(isVisible: boolean): void {
    if (isVisible) {
      this.getConfirmationMessageTitle()
        .should('be.visible')
        .should('have.text', 'Votre instance de test a été créée.');
    } else {
      this.getConfirmationMessageTitle().should('not.exist');
    }
  }

  checkIsInstanceUpdateConfirmationVisible(isVisible: boolean): void {
    if (isVisible) {
      this.getConfirmationMessageTitle()
        .should('be.visible')
        .should('have.text', 'Votre instance de test a été mise à jour.');
    } else {
      this.getConfirmationMessageTitle().should('not.exist');
    }
  }

  hideConfirmationMessage(): void {
    this.getConfirmationMessageCloseButton().click();
  }

  findInstanceCard(
    instanceName: string,
    eventIndex = 1,
  ): Cypress.Chainable<InstanceCard | null> {
    let cardIndex;
    return this.getAllInstanceCards()
      .each(($el, index) => {
        const instanceNameActual = $el.find('h3 a').text();
        if (instanceNameActual === instanceName) {
          if (eventIndex === 1) {
            cardIndex = index;
            return false;
          }
          eventIndex = eventIndex - 1;
        }
      })
      .then(() => {
        if (cardIndex != undefined) {
          return this.getInstanceCard(cardIndex);
        } else {
          return null;
        }
      });
  }
}
