/* istanbul ignore file */

// Tested by DTO
import { MailerConfig, MailFrom } from '@fc/mailer';

const from: MailFrom = {
  email: process.env.MAILER_FROM_EMAIL,
  name: process.env.MAILER_FROM_NAME,
};
export default {
  templatePaths: JSON.parse(process.env.MAILER_TEMPLATES_PATHS),
  transport: process.env.MAILER,
  key: process.env.MAILJET_KEY,
  secret: process.env.MAILJET_SECRET,
  options: {
    proxyUrl: process.env.GLOBAL_AGENT_HTTPS_PROXY,
  },
  from,
} as MailerConfig;
