import type { MailerSendOptions } from "../src/interfaces";

export function getMailerServiceMock() {
  const sentMails: MailerSendOptions[] = [];
  return {
    sentMails,
    async sendMail(dto: MailerSendOptions) {
      sentMails.push(dto);
      return { messageId: "test-message-id" };
    },
  };
}
