/* istanbul ignore file */

// Tested by DTO
import * as fs from 'fs';
import * as path from 'path';
import { MailerConfig } from '@fc/mailer';

function getConnectNotificationEmailTemplateContent() {
  try {
    const EMAIL_TEMPLATE_FILEPATH = path.join(
      __dirname,
      'views',
      'connect-notification-email.tpl.ejs',
    );
    const templateContent = fs.readFileSync(EMAIL_TEMPLATE_FILEPATH, 'utf8');
    return templateContent;
  } catch (err) {
    // if config does not exists at build
    throw new Error(err.message);
  }
}

export default {
  template: getConnectNotificationEmailTemplateContent(),
  transport: process.env.MAILER,
  key: process.env.MAILJET_KEY,
  secret: process.env.MAILJET_SECRET,
  options: {
    proxyUrl: process.env.GLOBAL_AGENT_HTTPS_PROXY,
  },
  from: {
    email: process.env.MAILER_FROM_EMAIL,
    name: process.env.MAILER_FROM_NAME,
  },
} as MailerConfig;
