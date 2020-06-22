function basicSuccessScenario(params) {
  const {
    idpId,
    userName,
    sp = Cypress.env('UD1V2_ROOT_URL'),
    method
  } = params;
  const password = params.password || '123';

  // FS: Click on FC button
  cy.visit(sp);

  if (method === 'POST') {
    cy.get('#connect-POST').click();
  } else {
    cy.get('#connect-GET').click();
  }

  // FC: choose FI
  cy.url().should('include', `${Cypress.env('FC_INTERACTION_URL')}`);
  cy.get(`#idp-${idpId}`).click();

  // FI: Authenticate
  cy.url().should('include', `${Cypress.env('FI_INTERACTION_URL')}`);
  cy.get('input[name="login"]').clear().type(userName);
  cy.get('input[name="password"]').clear().type(password);

  cy.get('input[type="submit"]').click();

  // FC: Read confirmation message :D
  cy.url().should('match', /\/api\/v2\/interaction\/[0-9a-z_-]+\/consent/i);

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

/** @TODO Add a case with SP logout once implemented */
describe('No SSO', () => {
  // Given
  const loginInfo = {
    userName: 'test',
    password: '123',
    eidasLevel: 1,
    idpId: 'fip1v2',
  };

  const userInfos = {
    gender: 'Femme',
    givenName: 'Angela Claire Louise',
    familyName: 'DUBOIS',
    birthdate: '1962-08-24',
    birthplace: '75107',
    birthcountry: '99100',
  };
  it('should require full cinematic to login another SP', () => {
    // When
    //   ...Log into SP "A"
    basicSuccessScenario(loginInfo);
    checkInformations(userInfos);

    //   ...Then log  into SP "B"
    basicSuccessScenario({
      ...loginInfo,
      sp: Cypress.env('UD2V2_ROOT_URL')
    });

    // Then
    checkInformations(userInfos);
  });
  it('should run the whole cinematic all the times even for the same SP', () => {
    // When
    //   ...Log into SP
    basicSuccessScenario(loginInfo);
    checkInformations(userInfos);
    //   ...Logout from SP
    cy.get('a.nav-logout').click();
    cy.contains(
      `Vous devez vous authentifier afin d'accéder à vos données personnelles.`,
    );
    //   ...Log again into SP
    basicSuccessScenario(loginInfo);

    // Then
    checkInformations(userInfos);
  });
});

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

  it('should log in to User Dashboard with POST /authorize', () => {
    basicSuccessScenario({
      userName: 'test',
      password: '123',
      eidasLevel: 1,
      idpId: 'fip1v2',
      method: 'POST',
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