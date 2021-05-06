/// <reference types="cypress" />

export * from './environment';
export * from './identity-provider';
export * from './service-provider';
export * from './user';

// Cypress Alias
export type ChainableElement = Cypress.Chainable<JQuery<HTMLElement>>;
