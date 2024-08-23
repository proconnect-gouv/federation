export default class UdFraudFormPage {
  udRootUrl: string;

  constructor(udRootUrl: string) {
    this.udRootUrl = udRootUrl;
  }

  checkHasFraudSurveyOriginQueryParam(fraudSurveyOrigin: string): void {
    cy.url().should('include', `?fraudSurveyOrigin=${fraudSurveyOrigin}`);
  }

  checkIsVisible(): void {
    const formUrl = `${this.udRootUrl}/fraud/form`;
    cy.url().should('include', formUrl);
  }
}
