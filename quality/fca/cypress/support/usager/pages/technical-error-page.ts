export default class TechnicalErrorPage {
  checkIsVisible(): void {
    cy.get('h1').contains('Une erreur est survenue lors de la connexion.');
  }

  checkErrorCode(errorCode: string): void {
    cy.get('#error-code').contains(`Code d’erreur : ${errorCode}`);
  }

  checkErrorMessage(errorMessage: string): void {
    cy.get('#error-message').contains(`${errorMessage}`);
  }

  checkSessionNumberVisible(): void {
    /**
     * @TODO Change css selector once unique selector will be implemented
     */
    cy.get('div.detail-error-container > p:nth-child(3)')
      .invoke('text')
      .should(
        'match',
        /ID : [0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
      );
  }
}
