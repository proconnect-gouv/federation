import type { MailerConfig } from "../dto";
import type { MailerSendOptions } from "../interfaces";
import type { MailerService } from "../mailer.service";

interface BrevoResponse {
  messageId: string;
}

export class BrevoAdapter implements MailerService {
  private readonly apiKey: string;

  constructor(
    private readonly config: MailerConfig,
    private readonly fetchFn: typeof globalThis.fetch,
  ) {
    this.apiKey = config.brevoApiKey!;
  }

  async sendMail(dto: MailerSendOptions) {
    const response = await this.fetchFn("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": this.apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: this.config.fromName, email: this.config.fromEmail },
        to: [{ email: dto.to }],
        subject: dto.subject,
        htmlContent: dto.htmlContent,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Brevo API error: ${response.status} ${await response.text()}`,
      );
    }

    const data = (await response.json()) as BrevoResponse;
    return { messageId: data.messageId };
  }
}
