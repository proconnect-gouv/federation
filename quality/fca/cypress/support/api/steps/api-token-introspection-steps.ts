import { Then } from '@badeball/cypress-cucumber-preprocessor';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { getServiceProviderByDescription } from '../../common/helpers';
import {
  GetTokenIntrospectionExpiredTokenDto,
  GetTokenIntrospectionValidTokenDto,
} from '../dto/post-token-introspection.dto';

Then("le corps de la réponse contient un JWT d'introspection", function () {
  cy.get('@apiResponse')
    .its('body')
    .then((body) => {
      expect(body).to.be.a('string');
      expect(body.length).to.be.greaterThan(500);
      const jwk = Cypress.env('EC_ENC_PRIV_KEY');
      cy.task('getJwtContent', { jwk, jwt: body }).then((jwtContent) => {
        const content = JSON.stringify(jwtContent, null, 2);
        cy.document().then((document) => {
          document.documentElement.innerHTML = content;
        });
        cy.get('body')
          .invoke('text')
          .then((json) => JSON.parse(json))
          .as('jwt');
      });
    });
});

Then(
  "le checktoken endpoint envoie un token d'introspection valide",
  function () {
    cy.get('@tokenIntrospection')
      .its('token_introspection.active')
      .should('equal', true);

    cy.get('@tokenIntrospection').then(async (rawTokenIntrospection) => {
      const tokenIntrospection = plainToInstance(
        GetTokenIntrospectionValidTokenDto,
        rawTokenIntrospection,
      );
      const errors = await validate(tokenIntrospection, {
        forbidNonWhitelisted: true,
        whitelist: true,
      });
      expect(errors, JSON.stringify(errors)).to.have.length(0);
    });
  },
);

Then(
  "le checktoken endpoint envoie un token d'introspection expiré",
  function () {
    cy.get('@tokenIntrospection')
      .its('token_introspection.active')
      .should('equal', false);

    cy.get('@tokenIntrospection').then(async (rawTokenIntrospection) => {
      const tokenIntrospection = plainToInstance(
        GetTokenIntrospectionExpiredTokenDto,
        rawTokenIntrospection,
      );
      const errors = await validate(tokenIntrospection, {
        forbidNonWhitelisted: true,
        whitelist: true,
      });
      expect(errors, JSON.stringify(errors)).to.have.length(0);
    });
  },
);

Then(
  "le token d'introspection a une propriété {string} égale à {string}",
  function (property: string, value: string) {
    cy.get('@tokenIntrospection')
      .its(`token_introspection.${property}`)
      .should('equal', value);
  },
);

Then(
  'le token d\'introspection a une propriété "sub" égale au sub mémorisé',
  function () {
    cy.get<string>('@spSub').then((previousSpSub) => {
      cy.get('@tokenIntrospection')
        .its(`token_introspection.sub`)
        .should('equal', previousSpSub);
    });
  },
);

Then(
  /le token d'introspection a une propriété "client_id" avec le client_id du fournisseur de service "([^"]+)"/,
  function (description: string) {
    const { clientId } = getServiceProviderByDescription(description);
    cy.get<GetTokenIntrospectionValidTokenDto>('@tokenIntrospection')
      .its('token_introspection.client_id')
      .should('equal', clientId);
  },
);

Then(
  'le token d\'introspection a une propriété "iat" avec le timestamp de création de l\'access token',
  function () {
    cy.get<GetTokenIntrospectionValidTokenDto>('@tokenIntrospection').then(
      (introspection) => {
        const {
          token_introspection: { iat },
        } = introspection;
        const nowTimestamp = Math.round(Date.now() / 1000);
        expect(iat).to.be.lte(nowTimestamp);
      },
    );
  },
);

Then(
  "le token d'introspection a une propriété \"exp\" avec le timestamp d'expiration de l'access token",
  function () {
    cy.get<GetTokenIntrospectionValidTokenDto>('@tokenIntrospection').then(
      (introspection) => {
        const {
          token_introspection: { exp },
        } = introspection;
        const nowTimestamp = Math.round(Date.now() / 1000);
        expect(exp).to.be.greaterThan(nowTimestamp);
      },
    );
  },
);
