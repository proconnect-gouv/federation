import { DateTime } from 'luxon';
import {
  USER_OPERATOR,
  USER_PASS,
  USER_SECURITY,
} from '../../support/constants';
import { createServiceProvider } from './service-provider-create.utils';

const BASE_URL = Cypress.config('baseUrl');

const basicConfiguration = {
  totp: true,
};

const fs = {
  name: 'CypressFS',
  platform: 'CORE_FCP',
  redirectUri: 'https://url.com',
  redirectUriLogout: 'https://url.com/logout',
  site: 'https://url.com',
  emails: 'titlen@gmail.com',
  ipAddresses: '192.0.0.0',
};

const fs2 = { ...fs, name: 'CypressFS2' };
const fs3 = { ...fs, name: 'CypressFS3' };

describe('Service provider list', () => {
  before(() => {
    cy.resetEnv('mongo');
    cy.login(USER_OPERATOR, USER_PASS);
    createServiceProvider(fs, basicConfiguration);
    createServiceProvider(fs2, basicConfiguration);
    createServiceProvider(fs3, basicConfiguration);
  });

  describe('List FS as Operator', () => {
    beforeEach(() => {
      cy.login(USER_OPERATOR, USER_PASS);
    });

    it('I can see when my clientId is generate', () => {
      cy.visit(`/service-provider?page=1&limit=9000`);

      cy.contains(`${fs.name}`).should('be.visible');

      cy.get('a[id="name-desc"]').click();
      cy.get('.time-client-id')
        .last()
        .then((item) => {
          const todaysDate = DateTime.now().toFormat('dd/MM/yyyy');
          const test = item[0].textContent;
          expect(todaysDate).to.equal(test);
        });
    });

    it('I can see when my secret is generate', () => {
      cy.visit(`/service-provider?page=1&limit=9000`);

      cy.contains(`${fs.name}`).should('be.visible');

      cy.get('a[id="name-desc"]').click();
      cy.get('.time-secret')
        .last()
        .then((item) => {
          const todaysDate = DateTime.now().toFormat('dd/MM/yyyy');
          const test = item[0].textContent;
          expect(todaysDate).to.equal(test);
        });
    });

    it('Query "sortField" and "sortDirection" are visible if I click on name-asc button', () => {
      cy.visit(`/service-provider`);

      cy.get('a[id="name-asc"]').click();

      cy.url().should((urlString) => {
        const url = new URL(urlString);
        expect(url.pathname).to.eq('/service-provider');
        const params = url.searchParams;
        expect(params.get('sortField')).to.eq('name');
        expect(params.get('sortDirection')).to.eq('asc');
        expect(params.get('limit')).to.eq('10');
        expect(params.get('page')).to.eq('1');
      });
    });

    it('Query "sortField" and "sortDirection" are visible if I click on createdAt-asc button', () => {
      cy.visit(`/service-provider`);

      cy.get('a[id="createdAt-asc"]').click();

      cy.url().should((urlString) => {
        const url = new URL(urlString);
        expect(url.pathname).to.eq('/service-provider');
        const params = url.searchParams;
        expect(params.get('sortField')).to.eq('createdAt');
        expect(params.get('sortDirection')).to.eq('asc');
        expect(params.get('limit')).to.eq('10');
        expect(params.get('page')).to.eq('1');
      });
    });

    it('Query "sortField" and "sortDirection" are visible if I click on secretUpdatedAt-asc button', () => {
      cy.visit(`/service-provider`);

      cy.get('a[id="secretUpdatedAt-asc"]').click();

      cy.url().should((urlString) => {
        const url = new URL(urlString);
        expect(url.pathname).to.eq('/service-provider');
        const params = url.searchParams;
        expect(params.get('sortField')).to.eq('secretUpdatedAt');
        expect(params.get('sortDirection')).to.eq('asc');
        expect(params.get('limit')).to.eq('10');
        expect(params.get('page')).to.eq('1');
      });
    });

    it('Query "sortField" and "sortDirection" are visible if I click on active-asc button', () => {
      cy.visit(`/service-provider`);

      cy.get('a[id="active-asc"]').click();

      cy.url().should((urlString) => {
        const url = new URL(urlString);
        expect(url.pathname).to.eq('/service-provider');
        const params = url.searchParams;
        expect(params.get('sortField')).to.eq('active');
        expect(params.get('sortDirection')).to.eq('asc');
        expect(params.get('limit')).to.eq('10');
        expect(params.get('page')).to.eq('1');
      });
    });

    it('Query "sortField" and "sortDirection" are visible when I click on next button', () => {
      cy.visit(
        `/service-provider?sortField=name&sortDirection=asc&page=1&limit=2`,
      );

      cy.get('a[id="name-asc"]').click();

      cy.url().should((urlString) => {
        const url = new URL(urlString);
        expect(url.pathname).to.eq('/service-provider');
        const params = url.searchParams;
        expect(params.get('sortField')).to.eq('name');
        expect(params.get('sortDirection')).to.eq('asc');
        expect(params.get('limit')).to.eq('2');
        expect(params.get('page')).to.eq('1');
      });

      cy.get('a[id="next-link"]').click();

      cy.url().should((urlString) => {
        const url = new URL(urlString);
        expect(url.pathname).to.eq('/service-provider');
        const params = url.searchParams;
        expect(params.get('sortField')).to.eq('name');
        expect(params.get('sortDirection')).to.eq('asc');
        expect(params.get('limit')).to.eq('2');
        expect(params.get('page')).to.eq('2');
      });
    });

    it('Query "sortField" and "sortDirection" are visible when I click on previous button', () => {
      cy.visit(
        `/service-provider?sortField=name&sortDirection=asc&limit=2&page=2`,
      );

      cy.get('a[id="previous-link"]').click();

      cy.url().should((urlString) => {
        const url = new URL(urlString);
        expect(url.pathname).to.eq('/service-provider');
        const params = url.searchParams;
        expect(params.get('sortField')).to.eq('name');
        expect(params.get('sortDirection')).to.eq('asc');
        expect(params.get('limit')).to.eq('2');
        expect(params.get('page')).to.eq('1');
      });
    });

    it('I can click on the name of the FS to go to the update page', () => {
      cy.visit(
        `/service-provider?sortField=name&sortDirection=asc&page=2&limit=2`,
      );

      cy.get('[id^="provider-"]:first').click();

      cy.url().should(
        'match',
        new RegExp(`${BASE_URL}\/service-provider\/[0-9a-f]{24}`),
      );
    });

    it('I can click on the client ID of the FS to go to the update secret page', () => {
      cy.visit(
        `/service-provider?sortField=name&sortDirection=asc&page=2&limit=2`,
      );

      cy.get('[id^="key-"]:first').click({ force: true });

      cy.url().should(
        'match',
        new RegExp(
          `${BASE_URL}\/service-provider\/update\/[0-9a-f]{24}\/secret`,
        ),
      );
    });
  });

  describe('List FS as Security', () => {
    beforeEach(() => {
      cy.login(USER_SECURITY, USER_PASS);
    });

    it("I can't click on the name of the FS to go to the update page", () => {
      cy.visit(
        `/service-provider?sortField=name&sortDirection=asc&limit=2&page=2`,
      );

      cy.get('#list-table > tbody > tr:first > th').then(($el) => {
        expect($el).to.not.have.descendants('a');
      });
    });

    it("I can't click on the client ID of the FS to go to the update secret page", () => {
      cy.visit(
        `/service-provider?sortField=name&sortDirection=asc&limit=2&page=2`,
      );

      cy.get('#list-table > tbody > tr:first > td').then(($el) => {
        expect($el).to.not.have.descendants('a');
      });
    });
  });
});
