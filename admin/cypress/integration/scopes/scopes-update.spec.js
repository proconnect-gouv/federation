import {
  USER_OPERATOR,
  USER_PASS,
} from '../../../src/shared/cypress/support/constants';
import {
  useMenuToFdPage,
  createScopeLabels,
  updateScopeLabel,
} from './scopes.utils';

const BASE_URL = Cypress.config('baseUrl');

describe('Update a scope label', () => {
  before(() => cy.resetEnv('mongo'));
  let configuration;

  beforeEach(() => {
    configuration = {
      totp: true,
    };
    cy.login(USER_OPERATOR, USER_PASS);
    useMenuToFdPage();
  });

  describe('Should be successful', () => {
    const scopeLabelsInfo = {
      label: 'Seldon Label',
      scope: `Seldon ${Math.random()}`,
      fd: 'IDENTITY',
    };

    const scopeLabelsUpdatedInfo = {
      label: 'Seldon Label',
      scope: `Seldon ${Math.random()}`,
      fd: 'IDENTITY',
    };

    it('if a valid form is submit', () => {
      cy.get(`table`)
        .scrollIntoView()
        .should('be.visible');

      createScopeLabels(scopeLabelsInfo, configuration);
      cy.get('button[type="submit"]').click();

      cy.url().should('eq', `${BASE_URL}/scopes/label`);
      cy.contains(
        `Le label ${scopeLabelsInfo.label} pour le scope ${scopeLabelsInfo.scope} a été créé avec succès !`,
      ).scrollIntoView();
      cy.get('.alert-success > .close').click();

      updateScopeLabel(
        scopeLabelsInfo.scope,
        scopeLabelsUpdatedInfo,
        configuration,
      );
      cy.get('button[type="submit"]').click();

      cy.url().should('eq', `${BASE_URL}/scopes/label`);

      cy.hasBusinessLog({
        entity: 'scope',
        action: 'update',
        user: USER_OPERATOR,
      });
    });
  });

  describe('Should fail', () => {
    it('if a invalid form is submit with invalid totp', () => {
      configuration = {
        totp: true,
      };

      const scopeLabelsInfo = {
        scope: `Seldon ${Math.random()}`,
        label: 'Seldon Label',
        fd: 'IDENTITY',
      };

      const scopeLabelsUpdatedInfo = {
        scope: `Seldon ${Math.random()}`,
        label: 'Seldon Label',
        fd: 'IDENTITY',
      };

      createScopeLabels(scopeLabelsInfo, configuration);
      cy.get('button[type="submit"]').click();
      cy.get('.alert-success > .close').click();

      updateScopeLabel(scopeLabelsInfo.scope, scopeLabelsUpdatedInfo, {
        ...configuration,
        totp: false,
      });
      cy.get('button[type="submit"]').click();

      cy.contains(`Le TOTP saisi n'est pas valide`).scrollIntoView();
    });
  });
});
