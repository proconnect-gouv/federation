import { ConfigParser } from '@fc/config';
import { AppConfig } from '@fc/mock-data-provider';
import { ProxyAgent } from 'proxy-agent';

const env = new ConfigParser(process.env, 'App');

export default {
  name: process.env.APP_NAME,
  urlPrefix: '/api',
  httpsOptions: {
    key: env.file('HTTPS_SERVER_KEY', { optional: true }),
    cert: env.file('HTTPS_SERVER_CERT', { optional: true }),
    agent: new ProxyAgent(),
  },
  apiAuthSecret: env.string('API_AUTH_SECRET'),
  environment: env.string('ENVIRONMENT'),
} as AppConfig;
