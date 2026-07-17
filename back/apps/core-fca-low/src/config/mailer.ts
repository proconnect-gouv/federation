import { ConfigParser } from "@fc/config";
import type { MailerConfig } from "@fc/mailer/dto";
import { TransportType } from "@fc/mailer/enums";

const env = new ConfigParser(process.env, "Mailer");

const mailerConfig: MailerConfig = {
  transport: env.string("TRANSPORT", true) as TransportType | undefined,
  fromEmail: env.string("FROM_EMAIL"),
  fromName: env.string("FROM_NAME"),
  smtpUrl: env.string("SMTP_URL", true),
  brevoApiKey: env.string("BREVO_API_KEY", true),
};

 export default mailerConfig;
