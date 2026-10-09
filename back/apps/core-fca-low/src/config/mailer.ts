import { ConfigParser } from "#libs/config";
import type { MailerConfig } from "#libs/mailer/dto/index";
import { TransportType } from "#libs/mailer/enums/index";

const env = new ConfigParser(process.env, "Mailer");

const mailerConfig: MailerConfig = {
  transport: env.string("TRANSPORT", true) as TransportType | undefined,
  fromEmail: env.string("FROM_EMAIL"),
  fromName: env.string("FROM_NAME"),
  smtpUrl: env.string("SMTP_URL", true),
  brevoApiKey: env.string("BREVO_API_KEY", true),
  emailSubjectPrefix: env.string("EMAIL_SUBJECT_PREFIX", true),
};

export default mailerConfig;
