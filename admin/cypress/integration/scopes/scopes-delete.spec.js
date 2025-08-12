import { USER_OPERATOR, USER_PASS } from '../../support/constants';
import { scrollToBottom } from './scopes.utils';

import {
  useMenuToFdPage,
  createScopeLabels,
  deleteScopeLabel,
} from './scopes.utils';

const BASE_URL = Cypress.config('baseUrl');

describe('Delete a scope label', () => {
  before(() => cy.resetEnv('mongo'));
  let configuration;
  let scopeLabelsInfo;

  beforeEach(() => {
    configuration = {
      totp: true,
    };
    cy.clearBusinessLog();

    cy.resetEnv('mongo');
    cy.login(USER_OPERATOR, USER_PASS);
    useMenuToFdPage();
  });

  it('Simply a delete icon', () => {
    scopeLabelsInfo = {
      scope: `scope_mock_value_${Math.random()}`,
      label: 'Seldon Label',
      fd: 'IDENTITY',
    };

    cy.get(`table`).scrollIntoView().should('be.visible');

    createScopeLabels(scopeLabelsInfo, configuration);
    cy.get('button[type="submit"]').click();

    cy.url().should('eq', `${BASE_URL}/scopes/label`);
    cy.contains(
      `Le label ${scopeLabelsInfo.label} pour le scope ${scopeLabelsInfo.scope} a été créé avec succès !`,
    );
    cy.get('.alert-success > .close').click();

    cy.contains(scopeLabelsInfo.scope).scrollIntoView().should('be.visible');
    cy.contains(scopeLabelsInfo.scope)
      .parent('tr')
      .find('.btn-action-delete')
      .should('be.visible');

    // remove test label
    deleteScopeLabel(scopeLabelsInfo.scope, configuration);
    cy.get('button[class="btn btn-success btn-yes"]').click();
    cy.get('.alert-success').should('be.visible');
  });

  describe('Should be successful', () => {
    it('if a valid totp is submit', () => {
      scopeLabelsInfo = {
        scope: `Seldon ${Math.random()}`,
        label: 'Seldon Label',
        fd: 'IDENTITY',
      };

      cy.get(`table`).scrollIntoView().should('be.visible');

      createScopeLabels(scopeLabelsInfo, configuration);
      cy.get('button[type="submit"]').click();

      cy.url().should('eq', `${BASE_URL}/scopes/label`);
      cy.contains(
        `Le label ${scopeLabelsInfo.label} pour le scope ${scopeLabelsInfo.scope} a été créé avec succès !`,
      );
      cy.get('.alert-success > .close').click();

      deleteScopeLabel(scopeLabelsInfo.scope, configuration);
      cy.get('button[class="btn btn-success btn-yes"]').click();
      cy.url().should('eq', `${BASE_URL}/scopes/label`);
      cy.get('.alert-success').should('be.visible');

      cy.hasBusinessLog({
        entity: 'scope',
        action: 'delete',
        user: USER_OPERATOR,
        name: scopeLabelsInfo.scope,
      });
    });

    it('if "annuler" button is clicked', () => {
      scopeLabelsInfo = {
        label: 'Seldon Label',
        scope: `Seldon ${Math.random()}`,
        fd: 'IDENTITY',
      };

      cy.get(`table`).scrollIntoView().should('be.visible');

      createScopeLabels(scopeLabelsInfo, configuration);
      cy.get('button[type="submit"]').click();

      cy.url().should('eq', `${BASE_URL}/scopes/label`);
      cy.contains(
        `Le label ${scopeLabelsInfo.label} pour le scope ${scopeLabelsInfo.scope} a été créé avec succès !`,
      );
      cy.get('.alert-success > .close').click();

      deleteScopeLabel(scopeLabelsInfo.scope, configuration);
      cy.wait(800);

      cy.get('button[class="btn btn-danger btn-no"]').click({ force: true });
      cy.url().should('eq', `${BASE_URL}/scopes/label`);
      // -- remove the control of the success popin because it's placed over a scrolling container
      // -- that Cypress detects as hiddening this popin...
      //cy.get('.alert-success').should('not.be.visible');

      // remove test label
      deleteScopeLabel(scopeLabelsInfo.scope, configuration);
      cy.get('button[class="btn btn-success btn-yes"]').click();
      cy.get('.alert-success').should('be.visible');
    });
  });

  describe('Should fail', () => {
    it('if a invalid totp is submit', () => {
      configuration = {
        totp: true,
      };
      scopeLabelsInfo = {
        scope: `Seldon ${Math.random()}`,
        label: 'Seldon Label',
        fd: 'IDENTITY',
      };

      cy.get(`table`).scrollIntoView().should('be.visible');

      createScopeLabels(scopeLabelsInfo, configuration);
      cy.get('button[type="submit"]').click();

      cy.url().should('eq', `${BASE_URL}/scopes/label`);
      cy.contains(
        `Le label ${scopeLabelsInfo.label} pour le scope ${scopeLabelsInfo.scope} a été créé avec succès !`,
      );
      cy.get('.alert-success > .close').click();

      deleteScopeLabel(scopeLabelsInfo.scope, {
        ...configuration,
        totp: false,
      });

      cy.get('button[class="btn btn-success btn-yes"]').click();
      cy.url().should('eq', `${BASE_URL}/scopes/label`);
      cy.get('div.alert-danger').should(
        'contain',
        "Le TOTP saisi n'est pas valide",
      );
    });
  });
});
