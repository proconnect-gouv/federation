import { ConfigParser } from '@fc/config';
import type { EmailValidatorConfig } from '@fc/email-validator/dto';

const env = new ConfigParser(process.env, 'EmailValidator');

export default {
  debounceApiKey: env.string('DEBOUNCE_API_KEY'),
} as EmailValidatorConfig;
