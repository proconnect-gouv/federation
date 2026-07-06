import type { MailerSendOptions } from "./interfaces";

export abstract class MailerService {
  abstract sendMail(dto: MailerSendOptions): Promise<{ messageId: string }>;
}
