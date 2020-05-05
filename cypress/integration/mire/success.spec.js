function basicSuccessScenario(params) {
  const { idpId, userName } = params;
  const password = params.password || '123';

  // FS: Click on FC button
  cy.visit(`${Cypress.env('UD_ROOT_URL')}`);

  cy.get('img[alt="Se connecter à FranceConnect"]').click();

  // FC: choose FI
  cy.url().should('include', `${Cypress.env('FC_ROOT_URL')}/interaction`);
  cy.get(`#idp-${idpId}`).click();

  // FI: Authenticate
  cy.url().should('include', `${Cypress.env('FI_ROOT_URL')}/interaction`);
  cy.get('input[name="login"]')
    .clear()
    .type(userName);
  cy.get('input[name="password"]')
    .clear()
    .type(password);

  cy.get('input[type="submit"]').click();

  // FC: Read confirmation message :D
  cy.url().should('match', /\/interaction\/[0-9a-z_-]+\/consent/i);

  cy.get('#consent').click();
}

function checkInformations(identity) {
  const {
    gender,
    givenName,
    familyName,
    preferredUsername = '/',
    birthdate,
    birthplace,
    birthcountry,
  } = identity;

  cy.contains(`Civilité : ${gender}`);
  cy.contains(`Prénom(s) : ${givenName}`);
  cy.contains(`Nom(s) : ${familyName}`);
  cy.contains(`Nom d'usage : ${preferredUsername}`);
  cy.contains(`Date de naissance : ${birthdate}`);

  if (birthplace) {
    cy.contains(`COG (lieu de naissance) : ${birthplace}`);
  }

  if (birthcountry) {
    cy.contains(`COG (Pays de naissance) : ${birthcountry}`);
  }
}

describe('Successful scenarios', () => {
  it('should log in to User Dashboard', () => {
    basicSuccessScenario({
      userName: 'test',
      password: '123',
      eidasLevel: 1,
      idpId: 'fip1v2',
    });

    checkInformations({
      gender: 'Femme',
      givenName: 'Angela Claire Louise',
      familyName: 'DUBOIS',
      birthdate: '1962-08-24',
      birthplace: '75107',
      birthcountry: '99100',
    });
  });

  it('should log in to User Dashboard a "présumé né jour"', () => {
    basicSuccessScenario({
      userName: 'étranger_présumé_né_jour',
      password: '123',
      eidasLevel: 1,
      idpId: 'fip1v2',
    });

    checkInformations({
      gender: 'Homme',
      givenName: 'Jean',
      familyName: 'FLEURET',
      birthdate: '1992-11-00',
      birthcountry: '99217',
    });
  });

  it('should log in to User Dashboard a "présumé né jour et mois"', () => {
    basicSuccessScenario({
      userName: 'étranger_présumé_né_jour_et_mois',
      password: '123',
      eidasLevel: 1,
      idpId: 'fip1v2',
    });

    checkInformations({
      gender: 'Homme',
      givenName: 'Jean',
      familyName: 'TARGE',
      birthdate: '1992-00-00',
      birthcountry: '99217',
    });
  });
});
