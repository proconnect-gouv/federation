/* istanbul ignore file */

// Tested by DTO
import { ConfigParser } from '@fc/config';
import { OtrsConfig } from '@fc/user-dashboard';

const env = new ConfigParser(process.env, 'Otrs');

export default {
  otrsEmail: env.string('EMAIL'),
  recipientName: env.string('RECIPIENT_NAME'),
  fraudEmailSubject: 'Demande de support - signalement usurpation d’identité',
} as OtrsConfig;
