import { USER_OPERATOR, USER_PASS } from '../../support/constants';
import {
  createIdentityProvider,
  updateIdentityProvider,
  assertFormValues,
} from './identity-provider.utils';

const BASE_URL = Cypress.config('baseUrl');

describe('Identity provider update', () => {
  let basicConfiguration;
  const fiToUpdateName = 'MonSuperFIUpdate';

  before(() => cy.resetEnv('mongo'));

  beforeEach(() => {
    cy.clearBusinessLog();
    basicConfiguration = {
      totp: true,
      fast: true,
    };
    cy.login(USER_OPERATOR, USER_PASS);
    cy.visit(`/identity-provider?page=1&limit=9001`);
  });

  describe('Should create an identity provider to update', () => {
    it('create the identity provider', () => {
      const idp = {
        name: fiToUpdateName,
        title: 'Mon Super FI Update mais mieux écrit',
        issuer: 'https://issuer.fr',
        authorizationUrl: 'https://issuer.fr/auth',
        tokenUrl: 'https://issuer.fr/token',
        userInfoUrl: 'https://issuer.fr/me',
        logoutUrl: 'https://issuer.fr/logout',
        statusUrl: 'https://issuer.fr/state',
        fqdns: 'example.com\nexample.net',
        discovery: 'false',
        jwksUrl: 'https://issuer.fr/discovery',
        clientId: '09a1a257648c1742c74d6a3d84b31943',
        client_secret: '1234567890AZERTYUIOP',
        messageToDisplayWhenInactive: 'SUPER MESSAGE !!!',
        redirectionTargetWhenInactive: 'https://issuer.fr/promo',
        alt: 'MonFI Image',
        image: 'AliceM.svg',
        imageFocus: 'AliceM.svg',
        trustedIdentity: 'false',
        siret: '34047343800034',
        allowedAcr: ['eidas2'],
        order: 1,
        emails: 'sherman@kaliop.com\nvbonnard@kaliopmail.com',
        specificText:
          "Veuillez fournir une capture d'écran de votre page de profil !",
        token_endpoint_auth_method: 'client_secret_post',
      };

      cy.visit(`/identity-provider`);
      createIdentityProvider(idp, basicConfiguration);

      cy.url().should('eq', `${BASE_URL}/identity-provider`);
      cy.contains(
        `Le fournisseur d'identité ${fiToUpdateName} a été créé avec succès !`,
      ).should('exist');
      cy.closeBanner('.alert-success');
    });
  });

  describe('Should succeed', () => {
    it('if title contains authorized special chars', () => {
      const idp = {
        title: "Mon FI à l'extrême: plein de _ & de œ!",
        issuer: 'https://new-new-issuer.fr',
        authorizationUrl: 'https://issuer.fr/auth',
        tokenUrl: 'https://issuer.fr/token',
        userInfoUrl: 'https://issuer.fr/me',
        discovery: 'false',
        discoveryUrl: '',
        logoutUrl: '',
        statusUrl: '',
        clientId: 'new-new-09a1a257648c1742c74d6a3d84b31943',
        client_secret: 'new-new-1234567890AZERTYUIOP',
        messageToDisplayWhenInactive: '',
        redirectionTargetWhenInactive: '',
        alt: '',
        image: '',
        imageFocus: '',
        order: '',
        emails: 'new-new-sherman@kaliop.com\nvbonnard@kaliopmail.com',
        specificText: '',
        allowedAcr: ['eidas2'],
        siret: '34047343800034',
      };
      updateIdentityProvider(fiToUpdateName, idp, basicConfiguration);

      cy.get('#successBanner')
        .contains(
          `Le fournisseur d'identité ${idp.title} a été modifié avec succès !`,
        )
        .should('exist');
      cy.get('#fi-subtitle')
        .contains(`Modifier le fournisseur d'identité: ${idp.title}`)
        .should('exist');
      cy.closeBanner('.alert-success');

      cy.hasBusinessLog({
        entity: 'identity-provider',
        action: 'update',
        user: USER_OPERATOR,
        name: idp.name,
      });

      assertFormValues(idp);
    });

    it('if only mandatory fields are provided without discovery', () => {
      const idp = {
        name: fiToUpdateName,
        title: 'Mon Super FI Update mais mieux écrit',
        issuer: 'https://issuer.fr',
        logoutUrl: 'https://issuer.fr/logout',
        statusUrl: 'https://issuer.fr/state',
        discovery: 'false',
        fqdns: 'example.org',
        clientId: '09a1a257648c1742c74d6a3d84b31943',
        client_secret: '1234567890AZERTYUIOP',
        messageToDisplayWhenInactive: 'SUPER MESSAGE !!!',
        redirectionTargetWhenInactive: 'https://issuer.fr/promo',
        alt: 'MonFI Image',
        image: 'AliceM.svg',
        imageFocus: 'AliceM.svg',
        trustedIdentity: 'false',
        siret: '34047343800034',
        allowedAcr: ['eidas2'],
        order: 1,
        emails: 'sherman@kaliop.com\nvbonnard@kaliopmail.com',
        specificText:
          "Veuillez fournir une capture d'écran de votre page de profil !",
        token_endpoint_auth_method: 'client_secret_post',
      };
      updateIdentityProvider(fiToUpdateName, idp, basicConfiguration);

      cy.get('#successBanner')
        .contains(
          `Le fournisseur d'identité ${idp.title} a été modifié avec succès !`,
        )
        .should('exist');
      cy.get('#fi-subtitle')
        .contains(`Modifier le fournisseur d'identité: ${idp.title}`)
        .should('exist');
      cy.closeBanner('.alert-success');

      assertFormValues(idp);
    });

    it('if only mandatory fields are provided with discovery', () => {
      const idp = {
        title: 'New - Mon Super FI Update en mode discovery',
        issuer: 'https://new-new-issuer.fr',
        discovery: 'true',
        discoveryUrl: 'https://new-issuer.fr/discoveryUrl',
        logoutUrl: '',
        statusUrl: '',
        jwksUrl: '',
        fqdns: 'example.com\nexample.net',
        clientId: 'new-new-09a1a257648c1742c74d6a3d84b31943',
        client_secret: 'new-new-1234567890AZERTYUIOP',
        messageToDisplayWhenInactive: '',
        redirectionTargetWhenInactive: '',
        alt: '',
        image: '',
        imageFocus: '',
        order: '',
        emails: 'new-new-sherman@kaliop.com\nvbonnard@kaliopmail.com',
        specificText: '',
        allowedAcr: ['eidas2'],
        siret: '34047343800034',
      };
      updateIdentityProvider(fiToUpdateName, idp, basicConfiguration);

      cy.contains(
        `Le fournisseur d'identité ${idp.title} a été modifié avec succès !`,
      ).should('exist');
      cy.contains(`Modifier le fournisseur d'identité: ${idp.title}`).should(
        'exist',
      );
      cy.closeBanner('.alert-success');

      assertFormValues(idp);
    });

    it('if mandatory fields and supportEmail are provided with discovery', () => {
      const idp = {
        title: 'New - Mon Super FI Update en mode discovery',
        issuer: 'https://new-new-issuer.fr',
        discovery: 'true',
        discoveryUrl: 'https://new-issuer.fr/discoveryUrl',
        logoutUrl: '',
        statusUrl: '',
        jwksUrl: '',
        clientId: 'new-new-09a1a257648c1742c74d6a3d84b31943',
        client_secret: 'new-new-1234567890AZERTYUIOP',
        messageToDisplayWhenInactive: '',
        redirectionTargetWhenInactive: '',
        alt: '',
        image: '',
        imageFocus: '',
        order: '',
        emails: 'new-new-sherman@kaliop.com\nvbonnard@kaliopmail.com',
        specificText: '',
        allowedAcr: ['eidas2'],
        siret: '34047343800034',
        supportEmail: 'valid@support.fr',
      };
      updateIdentityProvider(fiToUpdateName, idp, basicConfiguration);

      cy.contains(
        `Le fournisseur d'identité ${idp.title} a été modifié avec succès !`,
      ).should('exist');
      cy.contains(`Modifier le fournisseur d'identité: ${idp.title}`).should(
        'exist',
      );
      cy.closeBanner('.alert-success');

      assertFormValues(idp);
    });

    it('updates with algo fields', () => {
      const idp = {
        title: 'Super FI Update algo',
        issuer: 'https://new-issuer.fr',
        discovery: 'true',
        discoveryUrl: 'https://new-issuer.fr/discovery',
        logoutUrl: 'https://new-issuer.fr/logout',
        statusUrl: 'https://new-issuer.fr/state',
        clientId: 'new-09a1a257648c1742c74d6a3d84b31943',
        client_secret: 'new-1234567890AZERTYUIOP',
        active: 'true',
        display: 'true',
        messageToDisplayWhenInactive: 'New SUPER MESSAGE !!!',
        redirectionTargetWhenInactive: 'https://new-issuer.fr/promo',
        alt: 'new-MonFI Image',
        image: 'new-AliceM.svg',
        imageFocus: 'new-AliceM.svg',
        trustedIdentity: 'true',
        siret: '34047343800034',
        allowedAcr: ['eidas3'],
        order: 5,
        emails: 'new-sherman@kaliop.com\nvbonnard@kaliopmail.com',
        specificText:
          "new-Veuillez fournir une capture d'écran de votre page de profil !",
        userinfo_encrypted_response_enc: 'A256GCM',
        userinfo_encrypted_response_alg: 'RSA-OAEP',
        userinfo_signed_response_alg: 'ES256',
        id_token_signed_response_alg: 'ES256',
        id_token_encrypted_response_alg: 'RSA-OAEP',
        id_token_encrypted_response_enc: 'A256GCM',
        token_endpoint_auth_method: 'client_secret_post',
      };
      updateIdentityProvider(fiToUpdateName, idp, basicConfiguration);
      cy.get('#successBanner')
        .contains(
          `Le fournisseur d'identité ${idp.title} a été modifié avec succès !`,
        )
        .should('exist');
      cy.get('#fi-subtitle')
        .contains(`Modifier le fournisseur d'identité: ${idp.title}`)
        .should('exist');
      cy.closeBanner('.alert-success');

      assertFormValues(idp);
    });

    it('updates all fields but the name', () => {
      const idp = {
        title: 'New - Mon Super FI Update mais mieux écrit',
        issuer: 'https://new-issuer.fr',
        discovery: 'true',
        discoveryUrl: 'https://new-issuer.fr/discoveryUrl',
        logoutUrl: 'https://new-issuer.fr/logout',
        statusUrl: 'https://new-issuer.fr/state',
        clientId: 'new-09a1a257648c1742c74d6a3d84b31943',
        client_secret: 'new-1234567890AZERTYUIOP',
        active: 'true',
        display: 'true',
        messageToDisplayWhenInactive: 'New SUPER MESSAGE !!!',
        redirectionTargetWhenInactive: 'https://new-issuer.fr/promo',
        alt: 'new-MonFI Image',
        image: 'new-AliceM.svg',
        imageFocus: 'new-AliceM.svg',
        trustedIdentity: 'true',
        siret: '34047343800034',
        allowedAcr: ['eidas3'],
        order: 5,
        emails: 'new-sherman@kaliop.com\nvbonnard@kaliopmail.com',
        specificText:
          "new-Veuillez fournir une capture d'écran de votre page de profil !",
        token_endpoint_auth_method: 'client_secret_post',
      };
      updateIdentityProvider(fiToUpdateName, idp, basicConfiguration);

      cy.contains(
        `Le fournisseur d'identité ${idp.title} a été modifié avec succès !`,
      ).should('exist');
      cy.contains(`Modifier le fournisseur d'identité: ${idp.title}`).should(
        'exist',
      );
      cy.closeBanner('.alert-success');

      assertFormValues(idp);
    });

    it('accepts an empty siret', () => {
      const idp = {
        title: 'Mon Super FI Update mais mieux écrit',
        siret: '',
      };
      updateIdentityProvider(fiToUpdateName, idp, basicConfiguration);

      cy.contains(
        `Le fournisseur d'identité ${idp.title} a été modifié avec succès !`,
      ).should('exist');
      cy.contains(`Modifier le fournisseur d'identité: ${idp.title}`).should(
        'exist',
      );
      cy.closeBanner('.alert-success');

      assertFormValues(idp);
    });
  });

  describe('Should fail', () => {
    it('if any mandatory field is empty', () => {
      const idp = {
        title: '',
        issuer: '',
        authorizationUrl: '',
        tokenUrl: '',
        userInfoUrl: '',
        logoutUrl: '',
        statusUrl: '',
        jwksUrl: '',
        clientId: '',
        client_secret: '',
        messageToDisplayWhenInactive: '',
        redirectionTargetWhenInactive: '',
        discoveryUrl: '',
        alt: '',
        image: '',
        imageFocus: '',
        order: '',
        emails: '',
        specificText: '',
        allowedAcr: [],
        siret: '',
      };

      updateIdentityProvider(fiToUpdateName, idp, basicConfiguration);

      cy.contains(
        `Veuillez mettre un titre valide ( majuscule, minuscule, nombres et '.:_/!+- [espace] )`,
      ).should('exist');

      cy.contains(
        `Veuillez mettre une issuer URL valide au format https://issuer.fr`,
      ).should('exist');
    });

    it('if the totp is invalid', () => {
      const idp = {
        title: 'New - New - Mon Super FI Update mais mieux écrit',
        issuer: 'https://new-new-issuer.fr',
        logoutUrl: '',
        statusUrl: '',
        jwksUrl: '',
        clientId: 'new-new-09a1a257648c1742c74d6a3d84b31943',
        client_secret: 'new-new-1234567890AZERTYUIOP',
        messageToDisplayWhenInactive: '',
        redirectionTargetWhenInactive: '',
        discovery: true,
        discoveryUrl: 'https://new-issuer.fr/discoveryUrl',
        alt: '',
        image: '',
        imageFocus: '',
        order: '',
        emails: 'new-new-sherman@kaliop.com\nvbonnard@kaliopmail.com',
        specificText: '',
        siret: '34047343800034',
        allowedAcr: ['eidas2'],
      };

      basicConfiguration.totp = false;

      updateIdentityProvider(fiToUpdateName, idp, basicConfiguration);
      cy.contains(`Le TOTP saisi n'est pas valide`).should('exist');
      assertFormValues(idp);
    });

    it('if title contains invalid chars', () => {
      const idp = {
        title: 'Mon Super avec un < dedans',
      };

      basicConfiguration.totp = false;

      updateIdentityProvider(fiToUpdateName, idp, basicConfiguration);
      cy.contains(
        `Veuillez mettre un titre valide ( majuscule, minuscule, nombres et '.:_/!+- [espace] )`,
      )
        .scrollIntoView()
        .should('exist');
    });

    it('if siret is too short', () => {
      const idp = {
        siret: '88',
      };

      updateIdentityProvider(fiToUpdateName, idp, basicConfiguration);
      cy.contains(
        `siret must be longer than or equal to 14 characters`,
      )
        .scrollIntoView()
        .should('exist');
    });
  });
});
