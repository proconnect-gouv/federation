import { ConfigParser } from '@fc/config';
import type { EmailValidatorConfig } from '@fc/email-validator/dto';

const env = new ConfigParser(process.env, 'EmailValidator');

export default {
  domainWhitelist: env.stringArray('DOMAIN_WHITELIST'),
} as EmailValidatorConfig;
