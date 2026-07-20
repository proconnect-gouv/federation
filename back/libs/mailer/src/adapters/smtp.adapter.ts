import type { Transporter } from "nodemailer";

import type { MailerConfig } from "../dto";
import type { MailerSendOptions } from "../interfaces";
import type { MailerService } from "../mailer.service";

export class SmtpAdapter implements MailerService {
  constructor(
    private readonly config: MailerConfig,
    private readonly transporter: Transporter,
  ) {}

  async sendMail(dto: MailerSendOptions) {
    const result = await this.transporter.sendMail({
      from: { name: this.config.fromName, address: this.config.fromEmail },
      to: dto.to,
      subject: dto.subject,
      html: dto.htmlContent,
    });
    return { messageId: result.messageId };
  }
}
