import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

import {
  addInterceptHeaders,
  checkFCBasicAuthorization,
  getClaims,
  getIdpClaims,
  getRnippClaims,
  getScopeByType,
  isUsingFCBasicAuthorization,
  navigateTo,
} from '../../common/helpers';
import ServiceProviderPage from '../pages/service-provider-page';

let serviceProviderPage: ServiceProviderPage;

When('je navigue sur la page fournisseur de service', function () {
  const { allAppsUrl } = this.env;
  expect(this.serviceProvider).to.exist;
  serviceProviderPage = new ServiceProviderPage(this.serviceProvider);
  navigateTo({ appId: this.serviceProvider.name, baseUrl: allAppsUrl });
});

When('je clique sur le bouton FranceConnect', function () {
  if (serviceProviderPage.isLegacySPMock()) {
    // when on legacy service provider mock we call directly authorize
    const { fcRootUrl } = this.env;
    serviceProviderPage.callAuthorize(fcRootUrl, this.requestedScope);
    return;
  }

  // Setup the requested scope and eidas on mocked environment
  if (this.serviceProvider.mocked === true) {
    serviceProviderPage.setMockAuthorizeHttpMethod(
      this.serviceProvider.authorizeHttpMethod,
    );
    serviceProviderPage.setMockRequestedAmr(
      this.serviceProvider.claims.includes('amr'),
    );
    serviceProviderPage.setMockRequestedScope(this.requestedScope);
    serviceProviderPage.setMockRequestedAcr(this.serviceProvider.acrValue);
  }
  serviceProviderPage.getFcButton().click();

  if (isUsingFCBasicAuthorization()) {
    checkFCBasicAuthorization();
  }
});

When("je redemande les informations de l'usager", function () {
  serviceProviderPage.getUserInfoButton().click();
});

When(
  /^j'initie une connexion suspecte à (?:FranceConnect low|FranceConnect\+)$/,
  function () {
    // TODO to move to serviceProviderPage
    if (this.serviceProvider.mocked === true) {
      serviceProviderPage.setMockAuthorizeHttpMethod(
        this.serviceProvider.authorizeHttpMethod,
      );
      serviceProviderPage.setMockRequestedAmr(
        this.serviceProvider.claims.includes('amr'),
      );
      serviceProviderPage.setMockRequestedScope(this.requestedScope);
      serviceProviderPage.setMockRequestedAcr(this.serviceProvider.acrValue);
    }

    const headers = {
      'X-Suspicious': '1',
    };
    addInterceptHeaders(headers, 'FC:suspicious');

    serviceProviderPage.getFcButton().click();

    if (isUsingFCBasicAuthorization()) {
      checkFCBasicAuthorization();
    }
  },
);

Given(
  "je paramètre un intercepteur pour l'appel à la redirect_uri du fournisseur de service",
  function () {
    const { url } = this.serviceProvider;
    cy.intercept(`${url}/oidc-callback*`, (req) => {
      req.reply({
        body: '<h1>Intercepted request</h1>',
      });
    }).as('FS:OidcCallback');
  },
);

Given(
  'je mets le code renvoyé par FC au FS dans la propriété "code" du corps de la requête',
  function () {
    cy.wait('@FS:OidcCallback')
      .its('request.query.code')
      .should('exist')
      .then((value: string) => {
        this.apiRequest.body['code'] = value;
      });
  },
);

Given(
  'je mets l\'access token fourni par FC dans le paramètre "authorization" de l\'entête de la requête',
  function () {
    cy.get('@apiResponse')
      .its('body.access_token')
      .should('exist')
      .then((accessToken: string) => {
        this.apiRequest.headers['authorization'] = `Bearer ${accessToken}`;
      });
  },
);

Then('je suis redirigé vers la page fournisseur de service', function () {
  serviceProviderPage.checkIsVisible();
});

Then('je suis connecté au fournisseur de service', function () {
  // Init serviceProviderPage because this step can be called without
  // being preceded by the navigation step
  serviceProviderPage = new ServiceProviderPage(this.serviceProvider);
  serviceProviderPage.checkIsUserConnected();
});

When('je me déconnecte du fournisseur de service', function () {
  serviceProviderPage.getLogoutButton().click();
});

Then(
  /le fournisseur de service a accès aux informations (?:du|des) scopes? "([^"]+)"/,
  function (type: string) {
    const { allClaims } = this.user;
    if (this.serviceProvider.mocked === true) {
      serviceProviderPage.checkMandatoryData();
      const platform: string = Cypress.env('PLATFORM');
      const scope = getScopeByType(this.scopes, type);
      const expectedClaims = getClaims(scope);
      if (platform === 'fcp-high') {
        // Get automatically the equivalent RNIPP claims
        const rnippClaims = getRnippClaims(allClaims);
        const userClaims = {
          ...allClaims,
          ...rnippClaims,
        };
        serviceProviderPage.checkExpectedUserClaims(expectedClaims, userClaims);
        serviceProviderPage.checkNoExtraClaims(expectedClaims);
        return;
      }
      if (platform === 'fcp-low') {
        // Force the given_name_array claim into expectedClaim
        if (expectedClaims.includes('given_name')) {
          expectedClaims.push('given_name_array');
        }
        const idpClaims = getIdpClaims(allClaims);
        const userClaims = {
          ...allClaims,
          ...idpClaims,
        };
        serviceProviderPage.checkExpectedUserClaims(expectedClaims, userClaims);
        serviceProviderPage.checkNoExtraClaims(expectedClaims);
        return;
      }
      serviceProviderPage.checkExpectedUserClaims(expectedClaims, allClaims);
      serviceProviderPage.checkNoExtraClaims(expectedClaims);
    }
  },
);

Given('je mémorise le sub envoyé au fournisseur de service', function () {
  serviceProviderPage.getMockSubText().as('spSub');
});

Given(
  "je rentre l'id du fournisseur d'identité dans le champ idp_hint",
  function () {
    const { idpId } = this.identityProvider;
    serviceProviderPage.setIdpHint(idpId);
  },
);

Then(
  /^le sub transmis au fournisseur de service est (identique|différent) [ad]u sub mémorisé$/,
  function (text: string) {
    const comparison = text === 'identique' ? 'be.equal' : 'not.be.equal';

    cy.get<string>('@spSub').then((previousSpSub) => {
      serviceProviderPage.getMockSubText().should(comparison, previousSpSub);
    });
  },
);

Then(
  'le sub transmis au fournisseur de service est {string}',
  function (sub: string) {
    serviceProviderPage.getMockSubText().should('be.equal', sub);
  },
);

Then('le fournisseur de service a accès aux traces FranceConnect', function () {
  serviceProviderPage.checkTracks();
});

Then(
  'la cinématique a utilisé le niveau de sécurité {string}',
  function (acrValue: string) {
    serviceProviderPage.checkMockAcrValue(acrValue);
  },
);

Then("la cinématique a renvoyé l'amr {string}", function (amrValue: string) {
  serviceProviderPage.checkMockAmrValue(amrValue);
});

Then("la cinématique n'a pas renvoyé d'amr", function () {
  serviceProviderPage.checkMockAmrValue('N/A');
});

Then(
  'le token retourné au FS est signé avec la clé provenant du HSM',
  function () {
    serviceProviderPage.getMockIdTokenText().then((idToken: string) => {
      const es256SigPubKey = Cypress.env('ES256_SIG_PUB_KEY');
      cy.task('isJwsValid', {
        jws: idToken,
        sigPubKey: es256SigPubKey,
      }).should('be.true');
    });
  },
);

When('je révoque le token FranceConnect', function () {
  serviceProviderPage.getRevokeTokenButton().click();
});

Then('le token FranceConnect est révoqué', function () {
  serviceProviderPage.getTokenRevokationConfirmation().should('be.visible');
});

When(
  "le fournisseur de service demande l'accès aux données au fournisseur de données",
  function () {
    serviceProviderPage.getDataButton().click();
  },
);

Then(
  "le fournisseur de données vérifie l'access token fourni par le fournisseur de service",
  function () {
    serviceProviderPage.checkIsMockDataPageVisible();
    serviceProviderPage
      .getMockIntrospectionTokenText()
      .should('be.ok')
      .then((tokenText) => {
        const token = JSON.parse(tokenText);
        cy.wrap(token).as('tokenIntrospection');
      });
  },
);

Then(
  /^le message d'erreur (est|n'est pas) présent sur la mire$/,
  function (state: string) {
    const exist = state === 'est';
    serviceProviderPage
      .getInteractionErrorMessage()
      .should(exist ? 'be.visible' : 'not.exist');
  },
);
