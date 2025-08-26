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

Then(
  "je choisis le fournisseur d'identité {string} et le bouton {string} est activé",
  function (text: string, buttonText: string) {
    cy.contains('label', text).click();
    cy.contains('button', buttonText).should(
      'have.css',
      'pointer-events',
      'auto',
    );
    cy.contains('button', 'Continue').click();
  },
);

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

Then(
  'le fournisseur d\'identité "Autre" est positionné en dernier dans la liste des fournisseurs d\'identité',
  function () {
    cy.get('#radio-hint label').then((labels) => {
      const texts = Array.from(labels).map((label) =>
        label.textContent?.trim(),
      );
      const autreIndex = texts.indexOf('Autre');
      expect(autreIndex).to.equal(texts.length - 1);
    });
  },
);
