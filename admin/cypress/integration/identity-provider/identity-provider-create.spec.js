import {
  USER_OPERATOR,
  USER_PASS,
} from '../../../src/shared/cypress/support/constants';
import {
  createIdentityProvider,
  assertFormValues,
} from './identity-provider.utils';

const BASE_URL = Cypress.config('baseUrl');

describe('Identity provider creation', () => {
  let basicConfiguration;

  before(() => cy.resetEnv('mongo'));
  beforeEach(() => {
    cy.clearBusinessLog();

    basicConfiguration = {
      totp: true,
      fast: true,
    };
    cy.login(USER_OPERATOR, USER_PASS);
    cy.visit(`/identity-provider`);
  });

  describe('Should succeed', () => {
    it('should set the identity provider to default values when created', () => {
      cy.url().should('eq', `${BASE_URL}/identity-provider`);
      cy.contains("Créer un fournisseur d'identité").click();
      cy.get('[name="discovery"]:checked').should('have.value', 'false');
      cy.get('[name="discoveryUrl"]').should('be.disabled');
      cy.get('[name="trustedIdentity"]:checked').should('have.value', 'false');
      cy.get('[name="active"]:checked').should('have.value', 'false');
      cy.get('[name="display"]:checked').should('have.value', 'false');
    });

    it('if all fields are provided', () => {
      const idp = {
        name: 'MonSuperFI',
        title: 'Mon Super FI mais mieux écrit',
        issuer: 'https://issuer.fr',
        authorizationUrl: 'https://issuer.fr/auth',
        tokenUrl: 'https://issuer.fr/token',
        userInfoUrl: 'https://issuer.fr/me',
        statusUrl: 'https://issuer.fr/state',
        jwksUrl: 'https://issuer.fr/jwks',
        discovery: 'false',
        clientId: '09a1a257648c1742c74d6a3d84b31943',
        client_secret: '1234567890AZERTYUIOP',
        messageToDisplayWhenInactive: 'SUPER MESSAGE !!!',
        redirectionTargetWhenInactive: 'https://issuer.fr/promo',
        alt: 'MonFI Image',
        image: 'AliceM.svg',
        imageFocus: 'AliceM.svg',
        trustedIdentity: 'false',
        allowedAcr: ['eidas2'],
        order: 1,
        emails: 'sherman@kaliop.com\nvbonnard@kaliopmail.com',
        specificText:
          "Veuillez fournir une capture d'écran de votre page de profil !",
        token_endpoint_auth_method: 'client_secret_post',
        siret: '34047343800034',
      };

      createIdentityProvider(idp, basicConfiguration);

      cy.url().should('eq', `${BASE_URL}/identity-provider`);
      cy.contains(
        `Le fournisseur d'identité MonSuperFI a été créé avec succès !`,
      ).should('exist');
      cy.get('.alert-success > .close').click();

      cy.hasBusinessLog({
        entity: 'identity-provider',
        action: 'create',
        user: USER_OPERATOR,
        name: idp.name,
      });
    });

    it('if only mandatory fields are provided', () => {
      const idp = {
        name: 'MonSuperFI-2',
        title: 'Mon Super FI 2 mais mieux écrit',
        issuer: 'https://issuer.fr',
        authorizationUrl: 'https://issuer.fr/auth',
        jwksUrl: 'https://issuer.fr/jwks',
        tokenUrl: 'https://issuer.fr/token',
        userInfoUrl: 'https://issuer.fr/me',
        clientId: '09a1a257648c1742c74d6a3d84b31943',
        client_secret: '1234567890AZERTYUIOP',
        emails: 'sherman@kaliop.com\nvbonnard@kaliopmail.com',
        token_endpoint_auth_method: 'client_secret_post',
        allowedAcr: ['eidas2'],
        siret: '34047343800034',
      };
      createIdentityProvider(idp, basicConfiguration);

      cy.url().should('eq', `${BASE_URL}/identity-provider`);
      cy.contains(
        `Le fournisseur d'identité MonSuperFI-2 a été créé avec succès !`,
      ).should('exist');
      cy.get('.alert-success > .close').click();
    });

    it('if there is a valid supportEmail', () => {
      const idp = {
        name: 'MonSuperFI-2',
        title: 'Mon Super FI 2 mais mieux écrit',
        issuer: 'https://issuer.fr',
        authorizationUrl: 'https://issuer.fr/auth',
        jwksUrl: 'https://issuer.fr/jwks',
        tokenUrl: 'https://issuer.fr/token',
        userInfoUrl: 'https://issuer.fr/me',
        clientId: '09a1a257648c1742c74d6a3d84b31943',
        client_secret: '1234567890AZERTYUIOP',
        emails: 'sherman@kaliop.com\nvbonnard@kaliopmail.com',
        token_endpoint_auth_method: 'client_secret_post',
        allowedAcr: ['eidas2'],
        siret: '34047343800034',
        supportEmail: 'support@myidp.fr',
      };
      createIdentityProvider(idp, basicConfiguration);

      cy.url().should('eq', `${BASE_URL}/identity-provider`);
      cy.contains(
        `Le fournisseur d'identité MonSuperFI-2 a été créé avec succès !`,
      ).should('exist');
      cy.get('.alert-success > .close').click();
    });

    it('if title contains authorized special chars', () => {
      const idp = {
        name: 'MonSuperFI-3',
        title: "Mon FI à l'extrême: plein de _ & de œ!",
        issuer: 'https://issuer.fr',
        authorizationUrl: 'https://issuer.fr/auth',
        tokenUrl: 'https://issuer.fr/token',
        userInfoUrl: 'https://issuer.fr/me',
        discovery: 'false',
        jwksUrl: 'https://issuer.fr/jwks',
        clientId: '09a1a257648c1742c74d6a3d84b31943',
        client_secret: '1234567890AZERTYUIOP',
        trustedIdentity: 'true',
        emails: 'sherman@kaliop.com\nvbonnard@kaliopmail.com',
        token_endpoint_auth_method: 'client_secret_post',
        allowedAcr: ['eidas2'],
        siret: '34047343800034',
      };
      createIdentityProvider(idp, basicConfiguration);

      cy.url().should('eq', `${BASE_URL}/identity-provider`);
      cy.contains(
        `Le fournisseur d'identité MonSuperFI-3 a été créé avec succès !`,
      ).should('exist');
      cy.get('.alert-success > .close').click();
    });

    it('if all fields are provided with algo fields ', () => {
      const idp = {
        name: 'MonFIWithAlgoFields',
        title: 'Mon Super FI mais mieux écrit',
        issuer: 'https://issuer.fr',
        statusUrl: 'https://issuer.fr/state',
        jwksUrl: 'https://issuer.fr/jwks',
        discovery: 'true',
        discoveryUrl: 'http://discoveryUrl.com',
        clientId: '09a1a257648c1742c74d6a3d84b31943',
        client_secret: '1234567890AZERTYUIOP',
        messageToDisplayWhenInactive: 'SUPER MESSAGE !!!',
        redirectionTargetWhenInactive: 'https://issuer.fr/promo',
        alt: 'MonFI Image',
        image: 'AliceM.svg',
        imageFocus: 'AliceM.svg',
        trustedIdentity: 'false',
        allowedAcr: ['eidas2'],
        order: 1,
        emails: 'sherman@kaliop.com\nvbonnard@kaliopmail.com',
        specificText:
          "Veuillez fournir une capture d'écran de votre page de profil !",
        userinfo_encrypted_response_enc: 'A256GCM',
        userinfo_encrypted_response_alg: 'RSA-OAEP',
        userinfo_signed_response_alg: 'ES256',
        id_token_signed_response_alg: 'ES256',
        id_token_encrypted_response_alg: 'RSA-OAEP',
        id_token_encrypted_response_enc: 'A256GCM',
        token_endpoint_auth_method: 'client_secret_post',
        siret: '34047343800034',
      };

      createIdentityProvider(idp, basicConfiguration);

      cy.url().should('eq', `${BASE_URL}/identity-provider`);
      cy.contains(
        `Le fournisseur d'identité MonFIWithAlgoFields a été créé avec succès !`,
      ).should('exist');
      cy.get('.alert-success > .close').click();
    });

    it('if discovery is set to true', () => {
      const idp = {
        name: 'MonSuperFI-Discovery-True',
        title: 'Mon Super FI 2 mais mieux écrit',
        issuer: 'https://issuer.fr',
        discovery: 'true',
        discoveryUrl: 'http://discoveryUrl.com',
        clientId: '09a1a257648c1742c74d6a3d84b31943',
        client_secret: '1234567890AZERTYUIOP',
        trustedIdentity: 'true',
        allowedAcr: ['eidas2'],
        emails: 'sherman@kaliop.com\nvbonnard@kaliopmail.com',
        token_endpoint_auth_method: 'client_secret_post',
        siret: '34047343800034',
      };
      createIdentityProvider(idp, basicConfiguration);

      cy.url().should('eq', `${BASE_URL}/identity-provider`);
      cy.contains(
        `Le fournisseur d'identité MonSuperFI-Discovery-True a été créé avec succès !`,
      ).should('exist');
      cy.get('.alert-success > .close').click();
    });
  });

  describe('Should fail', () => {
    it('if no field was filled', () => {
      const idp = {};

      createIdentityProvider(idp, basicConfiguration);
      cy.url().should('eq', `${BASE_URL}/identity-provider/create`);
      cy.contains(
        `Veuillez mettre un titre valide ( majuscule, minuscule, nombres et '.:_/!+- [espace] )`,
      )
        .scrollIntoView()
        .should('exist');
      cy.contains(
        `Veuillez mettre un nom valide ( majuscule, minuscule, nombres et '.:_/!+- [espace] )`,
      )
        .scrollIntoView()
        .should('exist');
      cy.contains(
        `Veuillez mettre une issuer URL valide au format https://issuer.fr`,
      )
        .scrollIntoView()
        .should('exist');
      cy.contains(
        `Veuillez mettre une token URL valide au format https://issuer.fr/token`,
      )
        .scrollIntoView()
        .should('exist');
      cy.contains(`Veuillez saisir un clientId valide`)
        .scrollIntoView()
        .should('exist');
      cy.contains(`Veuillez saisir un client Secret valide`)
        .scrollIntoView()
        .should('exist');
      cy.contains(`Veuillez saisir au moins un email`)
        .scrollIntoView()
        .should('exist');
    });

    it('if the title contains invalid chars', () => {
      const idp = {
        name: 'MonSuperFI-2',
        title: 'Mon Super avec un < dedans',
        issuer: 'https://issuer.fr',
        authorizationUrl: 'https://issuer.fr/auth',
        tokenUrl: 'https://issuer.fr/token',
        discovery: 'false',
        jwksUrl: 'https://issuer.fr/jwks',
        userInfoUrl: 'https://issuer.fr/me',
        clientId: '09a1a257648c1742c74d6a3d84b31943',
        client_secret: '1234567890AZERTYUIOP',
        emails: 'sherman@kaliop.com\nvbonnard@kaliopmail.com',
        token_endpoint_auth_method: 'client_secret_post',
        allowedAcr: ['eidas2'],
        siret: '34047343800034',
      };

      createIdentityProvider(idp, basicConfiguration);
      cy.url().should('eq', `${BASE_URL}/identity-provider/create`);
      cy.contains(
        `Veuillez mettre un titre valide ( majuscule, minuscule, nombres et '.:_/!+- [espace] )`,
      ).should('exist');
    });

    it('if supportEmail is invalid', () => {
      const idp = {
        name: 'MonSuperFI-2',
        title: 'Mon Super avec un dedans',
        issuer: 'https://issuer.fr',
        authorizationUrl: 'https://issuer.fr/auth',
        tokenUrl: 'https://issuer.fr/token',
        discovery: 'false',
        jwksUrl: 'https://issuer.fr/jwks',
        userInfoUrl: 'https://issuer.fr/me',
        clientId: '09a1a257648c1742c74d6a3d84b31943',
        client_secret: '1234567890AZERTYUIOP',
        supportEmail: 'notAnEmail',
        emails: 'sherman@kaliop.com\nvbonnard@kaliopmail.com',
        token_endpoint_auth_method: 'client_secret_post',
        allowedAcr: ['eidas2'],
        siret: '34047343800034',
      };

      createIdentityProvider(idp, basicConfiguration);
      cy.url().should('eq', `${BASE_URL}/identity-provider/create`);
    });

    it('if the totp is invalid', () => {
      const idp = {
        name: 'MonSuperFI-3',
        title: 'Mon Super FI 3 mais mieux écrit',
        issuer: 'https://issuer.fr',
        authorizationUrl: 'https://issuer.fr/auth',
        tokenUrl: 'https://issuer.fr/token',
        discovery: 'false',
        jwksUrl: 'https://issuer.fr/jwks',
        userInfoUrl: 'https://issuer.fr/me',
        clientId: '09a1a257648c1742c74d6a3d84b31943',
        client_secret: '1234567890AZERTYUIOP',
        trustedIdentity: 'true',
        active: 'true',
        display: 'true',
        emails: 'sherman@kaliop.com\nvbonnard@kaliopmail.com',
        token_endpoint_auth_method: 'client_secret_post',
        allowedAcr: ['eidas2'],
        siret: '34047343800034',
      };

      basicConfiguration.totp = false;

      createIdentityProvider(idp, basicConfiguration);
      cy.url().should('eq', `${BASE_URL}/identity-provider/create`);
      cy.contains(`Le TOTP saisi n'est pas valide`).should('exist');
      assertFormValues(idp);
    });
  });
});
