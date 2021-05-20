/* istanbul ignore file */

// Tested by DTO
import { MailerConfig, MailFrom } from '@fc/mailer';
import { ConfigParser } from '@fc/config';

const env = new ConfigParser(process.env, 'Mailer');

const from: MailFrom = {
  email: env.string('FROM_EMAIL'),
  name: env.string('FROM_NAME'),
};
export default {
templatePaths: env.json('TEMPLATES_PATHS'),
  transport: env.string('TRANSPORT'),
  key: env.string('MAILJET_KEY'),
  secret: env.string('MAILJET_SECRET'),
  options: {
    proxyUrl: process.env.GLOBAL_AGENT_HTTPS_PROXY,
  },
  from,
} as MailerConfig;
