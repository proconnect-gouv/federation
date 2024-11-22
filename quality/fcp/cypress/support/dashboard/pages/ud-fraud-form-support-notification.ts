import { MaildevHelper } from '../../common/helpers';
import { ChainableElement, Email } from '../../common/types';

const EMAIL_SUBJECT = 'Demande de support';

export default class UdFraudFormSupportNotificationPage {
  private isSupportRequestFromUser(message: Email, userEmail: string): boolean {
    return (
      message.subject.includes(EMAIL_SUBJECT) &&
      MaildevHelper.isMessageFromUser(message, userEmail)
    );
  }

  visitLastSupportRequest(contactEmail: string): Cypress.Chainable<Email> {
    return cy.maildevGetAllMessages().then((messages) => {
      const supportRequestMessage = messages
        .reverse()
        .find((message) =>
          this.isSupportRequestFromUser(message, contactEmail),
        );
      expect(
        supportRequestMessage,
        `No emails sent from '${contactEmail}' concerning support request`,
      ).to.exist;
      cy.maildevVisitMessageById(supportRequestMessage.id);

      return cy.wrap(supportRequestMessage);
    });
  }

  getValueFromContentKey(contentKey: string): ChainableElement {
    return cy.get(`[data-testid="${contentKey}"]`);
  }

  checkContentKeyNotExist(contentKey: string): void {
    this.getValueFromContentKey(contentKey).should('not.exist');
  }

  checkContentKeyHasValue(contentKey: string, value: string): void {
    this.getValueFromContentKey(contentKey).should('have.text', value);
  }
}
