import { parseBoolean } from '@fc/shared/transforms/parse-boolean';

export default {
  transport: process.env.MAILER_TRANSPORT,
  from: {
    name: process.env.SMTP_SENDER_NAME,
    email: process.env.SMTP_SENDER_EMAIL,
  },
  options: {
    proxyUrl: process.env.HTTPS_PROXY,
    host: process.env.MAILER_HOST,
    port: parseInt(process.env.MAILER_PORT, 10),
    secure: parseBoolean(process.env.MAILER_SECURE),
    ignoreTLS: parseBoolean(process.env.MAILER_IGNORE_TLS),
  },
};
