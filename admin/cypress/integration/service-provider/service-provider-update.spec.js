import {
  USER_OPERATOR,
  USER_PASS,
} from '../../support/constants';
import { createServiceProvider } from './service-provider-create.utils';

const BASE_URL = Cypress.config('baseUrl');

const configuration = {};

describe('update a service-provider', () => {
  before(() => {
    Cypress.session.clearAllSavedSessions();
    cy.resetEnv('mongo');
  });
  beforeEach(() => {
    cy.clearBusinessLog();

    cy.login(USER_OPERATOR, USER_PASS);
  });

  describe('first step: create a Service Provider', () => {
    it('Should be able to add a sp ( all ) ', () => {
      // Arrange
      const mockConfig = {
        ...configuration,
        totp: true,
      };

      const sp = {
        name: 'MyFirstFSCypress',
        redirectUri: 'https://url.com',
        redirectUriLogout: 'https://url.com/logout',
        site: 'https://urlModificate.com\nhttps://urlModificate.com',
        emails: 'valenttin@gmail.com',
        ipAddresses: '192.0.0.0',
      };

      // Action
      createServiceProvider(sp, mockConfig);

      // Assert
      cy.url().should('eq', `${BASE_URL}/service-provider`);
      cy.contains(
        `Le fournisseur de service MyFirstFSCypress a été créé avec succès !`,
      );
    });
  });

  describe('Second step: update the Service Provider', () => {
    it('Should select "openid" if any other scope is checked and now display "openid" as disabled', () => {
      // Arrange
      const mockConfig = {
        ...configuration,
        totp: true,
      };

      const sp = {
        name: 'MyFirstFSCypress',
        redirectUri: 'https://url.com',
        redirectUriLogout: 'https://url.com/logout',
        site: 'https://urlModificate.com\nhttps://urlModificate.com',
        emails: 'valenttin@gmail.com',
        ipAddresses: '192.0.0.0',
      };

      // Action
      cy.visit(`/service-provider?page=1&limit=9000`);

      cy.contains(`${sp.name}`)
        .should('be.visible')
        .click();

      cy.formFill(sp, mockConfig);

      cy.get('[id="scope-given_name"]').check('given_name', { force: true });

      cy.get('[type="radio"]').check('public', { force: true });

      cy.get('form[name="fs-form"] button[type="submit"]').click();

      // Assert
      cy.formControl(sp);
      cy.get('#scope-openid').should('be.checked');
      cy.get('#scope-openid').should('be.disabled');
      cy.get('#scope-given_name').should('be.checked');

      cy.url().should('match', /\/service-provider\/[a-z0-9]{24}$/);
      cy.contains(
        `Le fournisseur de service ${sp.name} a été modifié avec succès !`,
      );
    });

    it('Should be able to update a sp ( all ) ', () => {
      // Arrange
      const mockConfig = {
        ...configuration,
        totp: true,
      };

      const sp = {
        name: 'MyFirstFSCypress',
        redirectUri: 'https://url.com',
        redirectUriLogout: 'https://url.com/logout',
        site: 'https://url.com\nhttps://url.com',
        emails: 'valenttin@gmail.com',
        ipAddresses: '192.0.0.0',
        scopes: ['openid'],
      };

      // Action
      cy.visit(`/service-provider?page=1&limit=9000`);

      cy.contains(`${sp.name}`).should('be.visible');

      cy.get('a.btn-action-update')
        .last()
        .click();

      cy.formFill(sp, mockConfig);
      cy.get('[id="scope-openid"]').check('openid', { force: true });

      cy.get('[type="radio"]').check('public', { force: true });

      cy.get('form[name="fs-form"] button[type="submit"]').click();

      // Assert
      cy.formControl(sp);
      cy.get('#scope-openid').should('be.checked');

      cy.url().should('match', /\/service-provider\/[a-z0-9]{24}$/);
      cy.contains(
        `Le fournisseur de service ${sp.name} a été modifié avec succès !`,
      );
    });

    it('Should be able to update a sp ( name with special chars ) ', () => {
      // Arrange
      const mockConfig = {
        ...configuration,
        totp: true,
      };

      const sp = { name: 'MyFirstFSCypress with 42 : ÉçïœâùÆ/ÙÈ.com+2 & ee' };

      // Action
      cy.visit(`/service-provider?page=1&limit=9000`);

      cy.contains(`MyFirstFSCypress`).should('be.visible');
      cy.get('a.btn-action-update')
        .last()
        .click();

      // Fill in form
      cy.formFill(sp, mockConfig);

      cy.get('form[name="fs-form"] button[type="submit"]').click();

      // Assert
      cy.formControl(sp);

      cy.contains(
        `Le fournisseur de service ${sp.name} a été modifié avec succès !`,
      );
    });

    it('Should be able to update a sp ( name ) ', () => {
      // Arrange
      const mockConfig = {
        ...configuration,
        totp: true,
      };

      const sp = { name: 'MyFirstFSCypressModificate' };

      // Action
      cy.visit(`/service-provider?page=1&limit=9000`);

      cy.contains(`MyFirstFSCypress`).should('be.visible');
      cy.get('a.btn-action-update')
        .last()
        .click();

      // Fill in form
      cy.formFill(sp, mockConfig);

      cy.get('form[name="fs-form"] button[type="submit"]').click();

      // Assert
      cy.formControl(sp);

      cy.contains(
        `Le fournisseur de service ${sp.name} a été modifié avec succès !`,
      );
    });

    it('Should be able to update a sp ( urlRedirectUri: one entry ) ', () => {
      // Arrange
      const mockConfig = {
        ...configuration,
        totp: true,
      };

      const sp = { redirectUri: 'https://urlModificate.com' };

      // Action
      cy.visit(`/service-provider?page=1&limit=9000`);

      cy.contains(`MyFirstFSCypressModificate`).should('be.visible');
      cy.get('a.btn-action-update')
        .last()
        .click();

      cy.formFill(sp, mockConfig);

      cy.get('form[name="fs-form"] button[type="submit"]').click();

      // Assert
      cy.contains(
        `Le fournisseur de service MyFirstFSCypressModificate a été modifié avec succès !`,
      );
      cy.formControl(sp);
    });

    it('Should be able to update a sp ( urlRedirectUri: multiple entries) ', () => {
      // Arrange
      const mockConfig = {
        ...configuration,
        totp: true,
      };

      const sp = {
        redirectUri: 'https://urlModificate.com\nhttps://urlModificate.com',
      };

      // Action
      cy.visit(`/service-provider?page=1&limit=9000`);

      cy.contains(`MyFirstFSCypress`).should('be.visible');
      cy.get('a.btn-action-update')
        .last()
        .click();

      cy.formFill(sp, mockConfig);

      cy.get('form[name="fs-form"] button[type="submit"]').click();

      // Assert
      cy.contains(
        `Le fournisseur de service MyFirstFSCypressModificate a été modifié avec succès !`,
      );
      cy.formControl(sp);
    });

    it('Should be able to update a sp ( mobile urlRedirectUri: multiple entries) ', () => {
      // Arrange
      const mockConfig = {
        ...configuration,
        totp: true,
      };

      const sp = {
        redirectUri:
          'franceconnect://openid_redirect_url\nfc+app01://openid_redirect_url\nFC-app.02://openid_redirect_url',
      };

      // Action
      cy.visit(`/service-provider?page=1&limit=9000`);

      cy.contains(`MyFirstFSCypress`).should('be.visible');
      cy.get('a.btn-action-update')
        .last()
        .click();

      cy.formFill(sp, mockConfig);

      cy.get('form[name="fs-form"] button[type="submit"]').click();

      // Assert
      cy.contains(
        `Le fournisseur de service MyFirstFSCypressModificate a été modifié avec succès !`,
      );
      cy.formControl(sp);
    });

    it('Should be able to update a sp ( mobile redirectUriLogout: multiple entries) ', () => {
      // Arrange
      const mockConfig = {
        ...configuration,
        totp: true,
      };

      const sp = {
        redirectUriLogout:
          'franceconnect://openid_redirect_url\nfc+app01://openid_redirect_url\nFC-app.02://openid_redirect_url',
      };

      // Action
      cy.visit(`/service-provider?page=1&limit=9000`);

      cy.contains(`MyFirstFSCypress`).should('be.visible');
      cy.get('a.btn-action-update')
        .last()
        .click();

      cy.formFill(sp, mockConfig);

      cy.get('form[name="fs-form"] button[type="submit"]').click();

      // Assert
      cy.contains(
        `Le fournisseur de service MyFirstFSCypressModificate a été modifié avec succès !`,
      );
      cy.formControl(sp);
    });

    it('Should be able to update a sp ( site: one entry ) ', () => {
      // Arrange
      const mockConfig = {
        ...configuration,
        totp: true,
      };

      const sp = { site: 'https://url.com' };

      // Action
      cy.visit(`/service-provider?page=1&limit=9000`);

      cy.contains(`MyFirstFSCypressModificate`).should('be.visible');
      cy.get('a.btn-action-update')
        .last()
        .click();

      cy.formFill(sp, mockConfig);

      cy.get('form[name="fs-form"] button[type="submit"]').click();

      // Assert
      cy.contains(
        `Le fournisseur de service MyFirstFSCypressModificate a été modifié avec succès !`,
      );
      cy.formControl(sp);
    });

    it('Should be able to update a sp ( site:multiple entries ) ', () => {
      // Arrange
      const mockConfig = {
        ...configuration,
        totp: true,
      };

      const sp = { site: 'https://site.com\nhttps://site.com' };

      // Action
      cy.visit(`/service-provider?page=1&limit=9000`);

      cy.contains(`MyFirstFSCypress`).should('be.visible');
      cy.get('a.btn-action-update')
        .last()
        .click();

      cy.formFill(sp, mockConfig);

      cy.get('form[name="fs-form"] button[type="submit"]').click();

      // Assert
      cy.contains(
        `Le fournisseur de service MyFirstFSCypressModificate a été modifié avec succès !`,
      );
      cy.formControl(sp);
    });

    it('Should be able to update a sp ( emails ) ', () => {
      // Arrange
      const mockConfig = {
        ...configuration,
        totp: true,
      };

      const sp = { emails: 'emailupdate@gmail.com' };

      // Action
      cy.visit(`/service-provider?page=1&limit=9000`);

      cy.contains(`MyFirstFSCypressModificate`).should('be.visible');
      cy.get('a.btn-action-update')
        .last()
        .click();

      cy.formFill(sp, mockConfig);

      cy.get('form[name="fs-form"] button[type="submit"]').click();

      // Assert
      cy.contains(
        `Le fournisseur de service MyFirstFSCypressModificate a été modifié avec succès !`,
      );
      cy.formControl(sp);
    });

    it('Should be able to update a sp with empty field except name ', () => {
      // Arrange
      const mockConfig = {
        ...configuration,
        totp: true,
      };

      const sp = {
        name: 'MyFirstFSCypressModificate',
        redirectUri: '',
        redirectUriLogout: '',
        site: '',
        emails: '',
        ipAddresses: '',
      };

      // Action
      cy.visit(`/service-provider?page=1&limit=9000`);

      cy.contains(`MyFirstFSCypressModificate`).should('be.visible');
      cy.get('a.btn-action-update')
        .last()
        .click();

      cy.formFill(sp, mockConfig);

      cy.get('form[name="fs-form"] button[type="submit"]').click();

      // Assert
      cy.contains(
        `Le fournisseur de service MyFirstFSCypressModificate a été modifié avec succès !`,
      );
      cy.formControl(sp);
    });

    it('Should not be able to update a sp with an error( name ) ', () => {
      // Arrange
      const mockConfig = {
        ...configuration,
        typeEvent: true,
        totp: true,
      };

      const sp = { name: 'My Service Provider <scrip>alert("");</script>' };

      // Action
      cy.visit(`/service-provider?page=1&limit=9000`);

      cy.contains(`MyFirstFSCypressModificate`).should('be.visible');
      cy.get('a.btn-action-update')
        .last()
        .click();

      cy.get('#fs-form').within(() => {
        cy.formFill(sp, mockConfig);
      });

      // Assert
      cy.contains(`Veuillez mettre des emails valides ( Ex: email@email.com )`);
    });

    it('Should not be able to update a sp with an error( emails ) ', () => {
      // Arrange
      const mockConfig = {
        ...configuration,
        typeEvent: true,
        totp: true,
      };

      const sp = { emails: '* *' };

      // Action
      cy.visit(`/service-provider?page=1&limit=9000`);

      cy.contains(`MyFirstFSCypressModificate`).should('be.visible');
      cy.get('a.btn-action-update')
        .last()
        .click();

      cy.get('#fs-form').within(() => {
        cy.formFill(sp, mockConfig);
      });

      // Assert
      cy.contains(`Veuillez mettre des emails valides ( Ex: email@email.com )`);
    });

    it('Should not be able to update a sp with an error( site ) ', () => {
      // Arrange
      const mockConfig = {
        ...configuration,
        typeEvent: true,
        totp: true,
      };

      const sp = { site: '**' };

      // Action
      cy.visit(`/service-provider?page=1&limit=9000`);

      cy.contains(`MyFirstFSCypressModificate`).should('be.visible');
      cy.get('a.btn-action-update')
        .last()
        .click();

      cy.get('#fs-form').within(() => {
        cy.formFill(sp, mockConfig);
      });

      // Assert
      cy.contains(`Veuillez mettre une URL valide ( Ex: https://site.com/ )`);
    });

    it('Should not be able to update a sp with an error( redirectUriLogout ) ', () => {
      // Arrange
      const mockConfig = {
        ...configuration,
        typeEvent: true,
        totp: true,
      };

      const sp = { redirectUriLogout: '**' };

      // Action
      cy.visit(`/service-provider?page=1&limit=9000`);

      cy.contains(`MyFirstFSCypressModificate`).should('be.visible');
      cy.get('a.btn-action-update')
        .last()
        .click();

      cy.get('#fs-form').within(() => {
        cy.formFill(sp, mockConfig);
      });

      // Assert
      cy.contains(
        `Veuillez mettre une URL valide ( Ex: https://urlvalide.com/ )`,
      );
    });

    it('Should not be able to update a sp with an error( redirectUri ) ', () => {
      // Arrange
      const mockConfig = {
        ...configuration,
        typeEvent: true,
        totp: true,
      };

      const sp = { redirectUri: '**' };

      // Action
      cy.visit(`/service-provider?page=1&limit=9000`);

      cy.contains(`MyFirstFSCypressModificate`).should('be.visible');
      cy.get('a.btn-action-update')
        .last()
        .click();

      cy.get('#fs-form').within(() => {
        cy.formFill(sp, mockConfig);
      });
      // Assert
      cy.contains(
        `Veuillez mettre une URL valide ( Ex: https://urlvalide.com/ )`,
      );
    });

    it('Should be able to update a sp ( scopes ) ', () => {
      // Arrange
      const mockConfig = {
        ...configuration,
        totp: true,
      };

      const sp = {
        name: 'MyFirstFSCypressModificate',
        redirectUri: 'https://url.com',
        redirectUriLogout: 'https://url.com/logout',
        site: 'https://urlModificate.com\nhttps://urlModificate.com',
        emails: 'valenttin@gmail.com',
        ipAddresses: '192.0.0.0',
      };

      // Action
      cy.visit(`/service-provider?page=1&limit=9000`);

      cy.contains(`MyFirstFSCypress`).should('be.visible');
      cy.get('a.btn-action-update')
        .last()
        .click();

      cy.formFill(sp, mockConfig);
      cy.get('#scope-email').uncheck();
      cy.get('form[name="fs-form"] button[type="submit"]').click();

      // Assert
      cy.contains(
        `Le fournisseur de service MyFirstFSCypressModificate a été modifié avec succès !`,
      );

      cy.contains('openid');
      cy.get('#scope-email').should('be.visible');
      cy.get('#scope-email').should('not.have.class', 'checked');

      cy.formControl(sp);
    });

    it('Should be able to change a sp into a resource server', () => {
      // Arrange
      const mockConfig = {
        ...configuration,
        totp: true,
      };

      const resourceServerData = {
        introspection_signed_response_alg: 'ES256',
        introspection_encrypted_response_alg: 'RSA-OAEP',
        introspection_encrypted_response_enc: 'A256GCM',
        response_types: 'code',
        grant_types: 'authorization_code\nrefresh_token',
        jwks_uri: 'https://example.com/jwks',
      };

      // Action
      cy.visit(`/service-provider?page=1&limit=9000`);

      cy.contains(`MyFirstFSCypress`).should('be.visible');
      cy.get('a.btn-action-update')
        .last()
        .click();

      cy.contains('Section Fournisseur de données').click();

      cy.formFill(resourceServerData, mockConfig);
      cy.get('form[name="fs-form"] button[type="submit"]').click();

      // Assert
      cy.contains(
        `Le fournisseur de service MyFirstFSCypressModificate a été modifié avec succès !`,
      );

      cy.formControl(resourceServerData);
    });

    it('Should not be able to update a sp if TOTP is empty', () => {
      // Arrange
      const mockConfig = {
        ...configuration,
        totp: undefined,
      };

      const sp = {
        name: 'MyFirstFSCypress',
        redirectUri: 'https://url.com',
        redirectUriLogout: 'https://url.com/logout',
        site: ['https://url.com\nhttps://url.com'],
        emails: 'valenttin@gmail.com',
        ipAddresses: '192.0.0.0',
      };

      // Action
      cy.visit(`/service-provider?page=1&limit=9000`);

      cy.contains(`MyFirstFSCypress`).should('be.visible');
      cy.get('a.btn-action-update')
        .last()
        .click();

      cy.get('#fs-form').within(() => {
        cy.formFill(sp, mockConfig);
      });

      cy.get('[type="radio"]').check('public', { force: true });
      cy.get('form[name="fs-form"] button[type="submit"]').click();

      // Assert
      cy.contains(`Veuillez mettre un code TOTP valide.`);
    });

    it('Should not be able to update a sp if TOTP is wrong', () => {
      // Arrange
      const mockConfig = {
        ...configuration,
        totp: false,
      };

      const sp = {
        name: 'MyFirstFSCypress',
        redirectUri: 'https://url.com',
        redirectUriLogout: 'https://url.com/logout',
        site: ['https://url.com\nhttps://url.com'],
        emails: 'valenttin@gmail.com',
        ipAddresses: '192.0.0.0',
      };

      // Action
      cy.visit(`/service-provider?page=1&limit=9000`);

      cy.contains(`MyFirstFSCypress`).should('be.visible');
      cy.get('a.btn-action-update')
        .last()
        .click();

      cy.get('#fs-form').within(() => {
        cy.formFill(sp, mockConfig);
      });

      cy.get('form[name="fs-form"] button[type="submit"]').click();

      // Assert
      cy.contains(`Le TOTP saisi n'est pas valide`);
    });
  });
});
