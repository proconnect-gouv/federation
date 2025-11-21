import { Result } from 'axe-core';

import { type OperatorUser } from '../../exploitation/helpers';
import { Environment } from './environment';

// Cypress Alias
export type ChainableElement = Cypress.Chainable<JQuery<HTMLElement>>;

declare global {
  namespace Cypress {
    interface Chainable {
      // custom commands
      clearThenType(text: string, options?: Partial<Cypress.TypeOptions>): void;
    }
  }
}

// Define Cucumber world interface
declare module 'mocha' {
  export interface Context {
    // Accessibility context
    allViolations?: Result[];
    newViolations?: Result[];

    // API context
    apiRequests: Partial<Cypress.RequestOptions>[];
    apiRequest?: Partial<Cypress.RequestOptions>;

    // BDD context
    env: Environment;
    operatorUser?: OperatorUser;
  }
}

export * from './environment';
export * from './identity-provider';
export * from './identity-provider-config';
export * from './service-provider';
export * from './service-provider-config';
