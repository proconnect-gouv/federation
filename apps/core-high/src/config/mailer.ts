import { MailerConfig } from '@fc/mailer';

export default {
  transport: process.env.MAILER,
  key: process.env.MAILJET_KEY,
  secret: process.env.MAILJET_SECRET,
  options: {
    proxyUrl: process.env.HTTPS_PROXY,
  },
  from: {
    email: process.env.MAILER_FROM_EMAIL,
    name: process.env.MAILER_FROM_NAME,
  },
} as MailerConfig;
