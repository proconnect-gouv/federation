import {
  USER_OPERATOR,
  USER_PASS,
  USER_SECURITY,
} from '../../support/constants';
import { createIdentityProvider } from './identity-provider.utils';

const BASE_URL = Cypress.config('baseUrl');

const basicConfiguration = {
  totp: true,
};

const fi = {
  name: 'FI1',
  title: 'Mon Super FI mais mieux écrit',
  issuer: 'https://issuer.fr',
  authorizationUrl: 'https://issuer.fr/auth',
  tokenUrl: 'https://issuer.fr/token',
  userInfoUrl: 'https://issuer.fr/me',
  statusUrl: 'https://issuer.fr/state',
  discovery: 'false',
  fqdns: 'yopmail.com',
  discoveryUrl: 'https://issuer.fr/discoveryUrl',
  jwksUrl: 'https://issuer.fr/discovery',
  clientId: '09a1a257648c1742c74d6a3d84b31943',
  client_secret: '1234567890AZERTYUIOP',
  siret: '34047343800034',
  order: 1,
  emails: 'sherman@kaliop.com\nvbonnard@kaliopmail.com',
};

const fi2 = { ...fi, name: 'FI2' };
const fi3 = { ...fi, name: 'FI3' };

describe('Identity provider creation', () => {
  before(() => {
    cy.resetEnv('mongo');
    cy.login(USER_OPERATOR, USER_PASS);
    cy.visit(`${BASE_URL}/identity-provider`);
    createIdentityProvider(fi, basicConfiguration);
    createIdentityProvider(fi2, basicConfiguration);
    createIdentityProvider(fi3, basicConfiguration);
  });

  describe('List FI as Operator', () => {
    beforeEach(() => {
      cy.login(USER_OPERATOR, USER_PASS);
      cy.visit(`${BASE_URL}/identity-provider`);
    });

    it('Query "sort" and "param" are visible if I click on name-asc button', () => {
      cy.visit(`${BASE_URL}/identity-provider`);

      cy.get('a[id="name-asc"]').click();

      cy.url().should((urlString) => {
        const url = new URL(urlString);
        expect(url.pathname).to.eq('/identity-provider');
        const params = url.searchParams;
        expect(params.get('limit')).to.eq('10');
        expect(params.get('page')).to.eq('1');
        expect(params.get('sortField')).to.eq('name');
        expect(params.get('sortDirection')).to.eq('asc');
      });
    });

    it('"Sort" && "param" are visible when I click on next button', () => {
      cy.visit(
        `${BASE_URL}/identity-provider?sortField=name&sortDirection=asc&page=1&limit=2`,
      );

      cy.get('a[id="next-link"]').click();

      cy.url().should((urlString) => {
        const url = new URL(urlString);
        expect(url.pathname).to.eq('/identity-provider');
        const params = url.searchParams;
        expect(params.get('limit')).to.eq('2');
        expect(params.get('page')).to.eq('2');
        expect(params.get('sortField')).to.eq('name');
        expect(params.get('sortDirection')).to.eq('asc');
      });
    });

    it('"Sort" && "param" are visible when I click on previous button', () => {
      cy.visit(
        `${BASE_URL}/identity-provider?limit=2&page=2&sortDirection=asc&sortField=name`,
      );

      cy.get('a[id="previous-link"]').click();

      cy.url().should((urlString) => {
        const url = new URL(urlString);
        expect(url.pathname).to.eq('/identity-provider');
        const params = url.searchParams;
        expect(params.get('limit')).to.eq('2');
        expect(params.get('page')).to.eq('1');
        expect(params.get('sortField')).to.eq('name');
        expect(params.get('sortDirection')).to.eq('asc');
      });
    });

    it('I can click on the name of the FI to go to the update page', () => {
      cy.visit(
        `${BASE_URL}/identity-provider?sortField=name&sortDirection=asc&page=2&limit=2`,
      );

      cy.get('[id^="provider-"]:first').click();

      cy.url().should(
        'match',
        new RegExp(`${BASE_URL}\/identity-provider\/[0-9a-f]{24}`),
      );
    });

    it('I can click on the technical name of the FI to go to the update page', () => {
      cy.visit(
        `${BASE_URL}/identity-provider?sortField=name&sortDirection=asc&page=2&limit=2`,
      );

      cy.get('[id^="technic-"]:first').click();

      cy.url().should(
        'match',
        new RegExp(`${BASE_URL}\/identity-provider\/[0-9a-f]{24}`),
      );
    });

    it('I can see the FQDNs of the FI', () => {
      cy.visit(
        `${BASE_URL}/identity-provider?sortField=createdAt&sortDirection=asc&page=1&limit=10&search=${fi.name}`,
      );
      cy.get('#list-table > tbody > tr:first > td:nth-child(3)').should(
        'contain',
        'yopmail.com',
      );
    });
  });

  describe('List FI as Security', () => {
    beforeEach(() => {
      cy.login(USER_SECURITY, USER_PASS);
      cy.visit(`${BASE_URL}/identity-provider`);
    });

    it("I can't click on the name of the FI to go to the update page", () => {
      cy.visit(
        `${BASE_URL}/identity-provider?sortField=name&sortDirection=asc&page=2&limit=2`,
      );

      const first = cy
        .get('#list-table > tbody > tr:first > *:first')
        .then(($el) => {
          expect($el).to.not.have.descendants('a');
        });

      first.next().then(($el) => {
        expect($el).to.not.have.descendants('a');
      });
    });
  });
});
