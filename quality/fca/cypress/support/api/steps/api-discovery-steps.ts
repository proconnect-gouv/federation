import { Then } from '@badeball/cypress-cucumber-preprocessor';

import { GetDiscoveryDto } from '../dto/get-discovery.dto';
import { validateDto } from '../helpers/class-validator-helper';

Then('le corps de la réponse contient une configuration openid', function () {
  cy.get('@apiResponse')
    .its('body')
    .then(async (body) => {
      const errors = await validateDto(body, GetDiscoveryDto, {
        forbidNonWhitelisted: true,
        whitelist: true,
      });
      expect(errors, JSON.stringify(errors)).to.have.length(0);
    });
});

Then(
  '{string} est présent dans la configuration openid',
  function (property: string) {
    cy.get('@apiResponse').its('body').its(property).should('exist');
  },
);

Then(
  "{string} n'est pas présent dans la configuration openid",
  function (property: string) {
    cy.get('@apiResponse').its('body').its(property).should('not.exist');
  },
);

Then(
  '{string} contient {string} dans la configuration openid',
  function (property: string, values: string) {
    const arrValues = values.split(' ');
    cy.get('@apiResponse')
      .its('body')
      .its(property)
      .should('include.members', arrValues);
  },
);

Then(
  '{string} ne contient pas {string} dans la configuration openid',
  function (property: string, values: string) {
    const arrValues = values.split(' ');
    cy.get('@apiResponse')
      .its('body')
      .its(property)
      .should('not.include.members', arrValues);
  },
);

Then(
  '{string} contient uniquement {string} dans la configuration openid',
  function (property: string, values: string) {
    const arrValues = values.split(' ');
    cy.get('@apiResponse')
      .its('body')
      .its(property)
      .should('deep.equal', arrValues);
  },
);
