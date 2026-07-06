import type { MailerSendOptions } from "../interfaces";
import type { MailerService } from "../mailer.service";

export class NoneAdapter implements MailerService {
  async sendMail(_dto: MailerSendOptions) {
    return { messageId: "" };
  }
}
