import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

const email = 'test@email.fr';

Given(
  "j'envoie une requête pour créer un FS avec une signature invalide",
  function () {
    const spDate = new Date();

    cy.request({
      body: {
        email,
      },
      headers: {
        'X-Signature': 'incorrect signature',
        'X-Timestamp': spDate.toISOString(),
      },
      method: 'POST',
      url: '/api/oidc_clients',
    }).then((response) => {
      expect(response.status).to.equal(401);
      expect(response.body).to.deep.equal({
        error: 'invalid_signature',
        error_description: 'Signature is not valid',
      });
    });
  },
);

Given("j'envoie une requête pour créer un FS", function () {
  // cy.intercept('POST', '/api/oidc_clients').as('createFS');
  const spDate = new Date();

  // add X-Signature and X-Timestamp headers

  cy.request({
    body: {
      email: 'test@email.fr',
      //   IPServerAddressesAndRanges: ['1.1.1.1'],
      //   // eslint-disable-next-line @typescript-eslint/naming-convention
      //   __v: 4,
      //   claims: ['amr'],
      //   createdAt: spDate,
      //   // client id 64 hex chars
      //   // entityId: secrets.token_hex(32), //  64 hex chars
      //   // client_secret: encrypt_symetric(
      //   //      CONFIG["client_secret_cipher_pass"], secrets.token_hex(32)
      //   //  ),
      //   credentialsFlow: false,
      //   email: 'test@email.fr',
      //   featureHandlers: {
      //     none: '',
      //   },
      //   id_token_encrypted_response_alg: '',
      //   id_token_encrypted_response_enc: '',
      //   id_token_signed_response_alg: 'HS256',
      //   identityConsent: false,
      //   key: 'secrets.token_hex(32)',
      //   scopes: [
      //     'openid',
      //     'given_name',
      //     'usual_name',
      //     'email',
      //     'uid',
      //     'siren',
      //     'siret',
      //     'organizational_unit',
      //     'belonging_population',
      //     'phone',
      //     'chorusdt',
      //     'idp_id',
      //     'idp_acr',
      //     'custom',
      //   ],
      //   secretUpdatedAt: spDate,
      //   site: 'https://site.com',
      //   title: 'Nouvelle application',
      //   trustedIdentity: false,
      //   type: 'public',
      //   updatedAt: spDate,
      //   updatedBy: 'espace-partenaires',
      //   userinfo_encrypted_response_alg: '',
      //   userinfo_encrypted_response_enc: '',
      //   userinfo_signed_response_alg: 'HS256',
    },
    headers: {
      'X-Signature': 'incorrect signature',
      'X-Timestamp': spDate.toISOString(),
    },
    method: 'POST',
    url: '/api/oidc_clients',
  }).then((response) => {
    // this.fsId = response.body.id;
  });
});
