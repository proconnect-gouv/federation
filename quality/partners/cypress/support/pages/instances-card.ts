import { ChainableElement } from '../types';

export default class InstanceCard {
  index: number;

  constructor(index: number) {
    this.index = index;
  }

  getCardButton(): ChainableElement {
    return cy.get('div.fr-card').eq(this.index);
  }

  getInstanceName(): ChainableElement {
    return this.getCardButton().find('h3 a');
  }

  getCreationDate(): ChainableElement {
    return this.getCardButton().find('p.fr-card__detail');
  }
}
