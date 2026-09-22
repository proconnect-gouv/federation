import type { MailerSendOptions } from "./interfaces";

export abstract class MailerService {
  abstract ping(): Promise<boolean>;
  abstract sendMail(dto: MailerSendOptions): Promise<{ messageId: string }>;
}
