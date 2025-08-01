import { Then } from '@badeball/cypress-cucumber-preprocessor';

Then(
  /^le fournisseur d'identité "([^"]+)" (est|n'est pas) affiché$/,
  function (idpName: string, text: string) {
    const isVisible = text === 'est';
    cy.get('#radio-hint label')
      .invoke('text')
      .should(isVisible ? 'contains' : 'not.contains', idpName);
  },
);

Then("je choisis le fournisseur d'identité {string}", function (text: string) {
  cy.contains('label', text).click();
  cy.contains('button', 'Continue').click();
});

Then(
  "je suis redirigé vers la page permettant la selection d'un fournisseur d'identité",
  function () {
    cy.contains('Choisir votre accès');
  },
);

Then(
  "je teste l'hybridge avec le fournisseur d'identité {string}",
  function (text: string) {
    cy.intercept(/.*rie.gouv.fr.*/).as('allRieRequests');

    cy.contains('label', text).click();
    cy.contains('button', 'Continue').click();

    cy.wait('@allRieRequests').then((interceptions) => {
      // Ensure interceptions is an array of requests
      const requests = Array.isArray(interceptions)
        ? interceptions
        : [interceptions];

      // Check if at least one request URL contains 'rie.gouv.fr'
      const hasMatchingUrl = requests.some((interception) =>
        interception.request.url.includes('rie.gouv.fr'),
      );

      // Log the result
      if (hasMatchingUrl) {
        cy.log("L'hybridge a bien été appelé.");
      }

      // Assert that at least one URL matches
      expect(hasMatchingUrl, 'Aucune URL ne contient "rie.gouv.fr"').to.be.true;
    });
  },
);
