import { USER_OPERATOR, USER_PASS } from '../../support/constants';
import { createServiceProvider } from './service-provider-create.utils';

const BASE_URL = Cypress.config('baseUrl');

const defaultConfig = {
  value: true,
  writable: false,
  enumerable: true,
  configurable: false,
};

const basicConfiguration = {
  fast: defaultConfig,
  typeEvent: {
    ...defaultConfig,
    value: false,
  },
  totp: defaultConfig,
};

describe('Service provider creation', () => {
  const spData = {
    name: 'MyFirstSP',
    redirectUri: 'https://url.com/login',
    redirectUriLogout: 'https://url.com/logout',
    emails: 'titlen@gmail.com',
    type: 'public',
    ipAddresses: '',
  };

  before(() => {
    Cypress.session.clearAllSavedSessions();
    cy.resetEnv('mongo');
  });
  beforeEach(() => {
    cy.clearBusinessLog();
    cy.login(USER_OPERATOR, USER_PASS);
  });

  describe('should have the right default configuration', () => {
    it('should have the default scopes checked when opening the creation form', () => {
      // Action
      cy.url().should('eq', `${BASE_URL}/service-provider`);
      cy.contains('Créer un fournisseur de service').click();

      // Assert
      cy.get('input#scope-openid').should('be.checked');
      cy.get('input#scope-given_name').should('be.checked');
      cy.get('input#scope-usual_name').should('be.checked');
      cy.get('input#scope-email').should('be.checked');
      cy.get('input#scope-uid').should('be.checked');
      cy.get('input#scope-siret').should('be.checked');
      cy.get('input#scope-phone').should('be.checked');
      cy.get('input#scope-idp_id').should('be.checked');
      cy.get('input#scope-custom').should('be.checked');
    });
  });

  describe('Should succeed', () => {
    it('if we add a sp even with localhost as redirectUri (integration) ', () => {
      // Action
      createServiceProvider(
        {
          ...spData,
          name: 'MyFirstSP localhost',
          redirectUri: 'https://localhost:9000',
        },
        basicConfiguration,
      );

      // Assert
      cy.url().should('eq', `${BASE_URL}/service-provider`);
      cy.contains(
        `Le fournisseur de service MyFirstSP localhost a été créé avec succès !`,
      );
      cy.closeBanner('.alert-success');
    });

    it('if we add a service provider even with localhost as redirectUriLogout ( integration ) ', () => {
      // Action
      createServiceProvider(
        {
          ...spData,
          name: 'MyFirstSP localhost logout',
          redirectUriLogout: 'https://localhost:9000/logout',
        },
        basicConfiguration,
      );

      // Assert
      cy.url().should('eq', `${BASE_URL}/service-provider`);
      cy.contains(
        `Le fournisseur de service MyFirstSP localhost logout a été créé avec succès !`,
      );
      cy.closeBanner('.alert-success');
    });

    it('if we add a service provider with two logout redirections', () => {
      // Action
      createServiceProvider(
        {
          ...spData,
          name: '2 logout uris',
          redirectUriLogout: 'https://url.com/logout\rhttps://url.com/logout',
        },
        basicConfiguration,
      );

      // Assert
      cy.url().should('eq', `${BASE_URL}/service-provider`);
      cy.contains(
        `Le fournisseur de service 2 logout uris a été créé avec succès !`,
      );
      cy.closeBanner('.alert-success');
    });

    it('if we add a service provider with two redirect uris', () => {
      // Action
      createServiceProvider(
        {
          ...spData,
          name: '2 redirect uris',
          redirectUri: 'https://url.com\rhttps://url2.com/',
        },
        basicConfiguration,
      );

      // Assert
      cy.url().should('eq', `${BASE_URL}/service-provider`);
      cy.contains(
        `Le fournisseur de service 2 redirect uris a été créé avec succès !`,
      );
      cy.closeBanner('.alert-success');
    });

    it('if we add a service provider even with a mobile URI scheme as redirectUri ( integration ) ', () => {
      // Action
      createServiceProvider(
        {
          ...spData,
          name: 'MyFirstSP mobile URI scheme',
          redirectUri:
            'fc+app01://openid_redirect_url\rfranceconnect://openid_redirect_url\rFC-app.02://openid_redirect_url',
        },
        basicConfiguration,
      );

      // Assert
      cy.url().should('eq', `${BASE_URL}/service-provider`);
      cy.contains(
        `Le fournisseur de service MyFirstSP mobile URI scheme a été créé avec succès !`,
      );
      cy.closeBanner('.alert-success');
    });

    it('if we add a service provider even with a mobile URI scheme as redirectUriLogout ( integration ) ', () => {
      // Action
      createServiceProvider(
        {
          ...spData,
          name: 'MyFirstSP mobile URI scheme logout',
          redirectUriLogout:
            'fc+app01://openid_redirect_url\rfranceconnect://openid_redirect_url\rFC-app.02://openid_redirect_url',
        },
        basicConfiguration,
      );

      // Assert
      cy.url().should('eq', `${BASE_URL}/service-provider`);
      cy.contains(
        `Le fournisseur de service MyFirstSP mobile URI scheme logout a été créé avec succès !`,
      );
      cy.closeBanner('.alert-success');
    });

    it('if we add a service provider with two emails', () => {
      // Action
      createServiceProvider(
        {
          ...spData,
          name: '2 emails',
          emails: 'titlen@gmail.com\rsecondemail@gmail.com',
        },
        basicConfiguration,
      );

      // Assert
      cy.url().should('eq', `${BASE_URL}/service-provider`);
      cy.contains(
        `Le fournisseur de service 2 emails a été créé avec succès !`,
      );
      cy.closeBanner('.alert-success');
    });

    it('if we add a service provider with two ipAddresses', () => {
      // Action
      createServiceProvider(
        {
          ...spData,
          name: '2 ipAddresses',
          ipAddresses: '192.0.0.0\r1.1.1.1',
        },
        basicConfiguration,
      );

      // Assert
      cy.url().should('eq', `${BASE_URL}/service-provider`);
      cy.contains(
        `Le fournisseur de service 2 ipAddresses a été créé avec succès !`,
      );
      cy.closeBanner('.alert-success');
    });

    it('if we add a service provider with no email', () => {
      // Action
      createServiceProvider(
        { ...spData, name: 'no email', emails: '' },
        basicConfiguration,
      );

      // Assert
      cy.url().should('eq', `${BASE_URL}/service-provider`);
      cy.contains(
        `Le fournisseur de service no email a été créé avec succès !`,
      );
      cy.closeBanner('.alert-success');
    });

    it('should have client secret in hexadecimal form', () => {
      // Action
      createServiceProvider(
        {
          ...spData,
          name: 'check hexa',
        },
        basicConfiguration,
      );

      // Assert
      cy.url().should('eq', `${BASE_URL}/service-provider`);
      cy.contains(
        `Le fournisseur de service check hexa a été créé avec succès !`,
      );
      cy.closeBanner('.alert-success');
      cy.contains('check hexa');
      cy.get('#list-table > tbody > tr > td').eq(0).click();
      cy.get('#client_secret')
        .invoke('val')
        .then((val) => {
          const hexaConstraints = /[0-9A-Fa-f]{64}/g;
          const secretIsValid = hexaConstraints.test(val);
          expect(secretIsValid).to.be.true;
        });
    });

    it('if we add a resource server', () => {
      // Action
      const resourceServerData = {
        name: 'MyFirstRS',
        introspection_signed_response_alg: 'HS256 - config FD par défaut',
        introspection_encrypted_response_alg: 'ECDH-ES - config FD par défaut',
        introspection_encrypted_response_enc: 'A256GCM - config FD par défaut',
        response_types: 'none',
        grant_types: 'none',
        jwks_uri: 'https://example.com/jwks',
      };
      createServiceProvider(resourceServerData, basicConfiguration);

      // Assert
      cy.url().should('eq', `${BASE_URL}/service-provider`);
      cy.contains(
        `Le fournisseur de service MyFirstRS a été créé avec succès !`,
      );
    });

    it('if we add a URIScheme in redirectUri field', () => {
      // Action
      createServiceProvider(
        {
          ...spData,
          name: 'MyFirstSP URIScheme',
          redirectUri:
            'franceconnect://url.com\rhttps://secondsite.com\rlocalhost',
        },
        basicConfiguration,
      );

      // Assert
      cy.url().should('eq', `${BASE_URL}/service-provider`);
      cy.contains(
        `Le fournisseur de service MyFirstSP URIScheme a été créé avec succès !`,
      );
      cy.closeBanner('.alert-success');
    });

    it('if we add a URIScheme in redirectUriLogout field', () => {
      // Action
      createServiceProvider(
        {
          ...spData,
          name: 'MyFirstSP URIScheme',
          redirectUriLogout:
            'franceconnect://url.com/logout\rhttps://secondsite.com/logout\rlocalhost:3000/logout',
        },
        basicConfiguration,
      );

      cy.contains(
        `Le fournisseur de service MyFirstSP URIScheme a été créé avec succès !`,
      );
    });

    it('if we add  a sp with no redirectUri, redirectUriLogout and ip', () => {
      // Action
      createServiceProvider(
        {
          ...spData,
          name: 'champs optionnels',
          redirectUri: '',
          redirectUriLogout: '',
          ipAddresses: '',
        },
        basicConfiguration,
      );

      // Assert
      cy.url().should('eq', `${BASE_URL}/service-provider`);

      cy.contains(
        `Le fournisseur de service champs optionnels a été créé avec succès !`,
      );
      cy.closeBanner('.alert-success');
    });

    it('if we add a name containing all kind of authorized chars', () => {
      // Action
      createServiceProvider(
        {
          ...spData,
          name: 'My_FS with 42 : ÉçïœâùÆ/ÙÈ.com+2 & ee',
          redirectUri:
            'franceconnect://url.com\rhttps://secondsite.com\rlocalhost',
          redirectUriLogout:
            'franceconnect://url.com/logout\rhttps://secondsite.com/logout\rlocalhost:3000/logout',
        },
        basicConfiguration,
      );

      cy.contains(
        `Le fournisseur de service My_FS with 42 : ÉçïœâùÆ/ÙÈ.com+2 & ee a été créé avec succès !`,
      );
    });
  });

  describe('Should fail', () => {
    it('if the validation form failed, it should re-gererate the csrf', () => {
      // Action
      createServiceProvider(
        {
          ...spData,
          name: 'MyFirstSP',
          ipAddresses: 'Obviously not an IP',
        },
        basicConfiguration,
      );

      // Assert
      cy.get('input[name="_csrf"]').should('not.have.value', '');
    });

    it('if an error occured in the form, we display errors (empty fields) ', () => {
      // Action
      createServiceProvider(
        {
          name: '',
          redirectUri: '',
          redirectUriLogout: '',
          emails: '',
          ipAddresses: '',
        },
        basicConfiguration,
      );

      // Assert
      cy.contains(
        '.invalid-feedback',
        `Veuillez mettre un nom valide ( majuscule, minuscule, nombres et '.:_/!+- [espace] )`,
      )
        .scrollIntoView()
        .should('be.visible');
      cy.get('[name="redirectUri"]').should('be.empty');
      cy.get('[name="redirectUriLogout"]').should('be.empty');
      cy.contains(
        `Veuillez mettre des emails valides ( Ex: email@email.com )`,
      ).should('not.be.visible');
      cy.get('[name="ipAddresses"]').should('be.empty');
    });

    it('if an error occured in the form, we display an error (name)', () => {
      // Action
      createServiceProvider(
        {
          ...spData,
          name: '',
        },
        basicConfiguration,
      );

      // Assert
      cy.contains(
        '.invalid-feedback',
        `Veuillez mettre un nom valide ( majuscule, minuscule, nombres et '.:_/!+- [espace] )`,
      )
        .scrollIntoView()
        .should('be.visible');
    });

    it('if an error occured in the form, we display an error (name with html)', () => {
      // Action
      createServiceProvider(
        {
          ...spData,
          name: 'test avec <script>',
        },
        basicConfiguration,
      );

      // Assert
      cy.contains(
        '.invalid-feedback',
        `Veuillez mettre un nom valide ( majuscule, minuscule, nombres et '.:_/!+- [espace] )`,
      )
        .scrollIntoView()
        .should('be.visible');
    });

    it('if an error occured in the form, we display an error (redirectUris)', () => {
      createServiceProvider(
        {
          ...spData,
          name: 'Good Name',
          redirectUri: '****',
        },
        basicConfiguration,
      );
      cy.contains(
        '.invalid-feedback',
        `Veuillez mettre une URL valide ( Ex: https://urlvalide.com/ )`,
      )
        .scrollIntoView()
        .should('be.visible');
    });

    it('if an error occured in the form, we display an error (redirectUriLogout)', () => {
      // Action
      createServiceProvider(
        {
          ...spData,
          name: 'Good Name',
          redirectUriLogout: '***',
        },
        basicConfiguration,
      );

      // Assert
      cy.contains(
        '.invalid-feedback',
        `Veuillez mettre une URL valide ( Ex: https://urlvalide.com/logout )`,
      )
        .scrollIntoView()
        .should('be.visible');
    });

    it('if an error occured in the form, we display an error (emails)', () => {
      // Arrange
      const errorFs = {
        ...spData,
        name: 'Good name',
        emails: '****',
      };

      // Action
      createServiceProvider(errorFs, basicConfiguration);

      // Assert
      cy.contains(`Veuillez mettre des emails valides ( Ex: email@email.com )`)
        .scrollIntoView()
        .should('be.visible');
    });

    it('if an error occured in the form, we display an error (ips addresses)', () => {
      // Action
      createServiceProvider(
        {
          ...spData,
          name: 'Good name',
          ipAddresses: '****',
        },
        basicConfiguration,
      );

      // Assert
      cy.contains(`Veuillez mettre des ips valides ( Ex: 1.1.1.1 )`)
        .scrollIntoView()
        .should('be.visible');
    });
  });
});
