/* istanbul ignore file */

// Tested by DTO
import {
  SessionGenericConfig,
  ISessionGenericCookieOptions,
} from '@fc/session-generic';
import { ConfigParser } from '@fc/config';

const env = new ConfigParser(process.env, 'Session');

const cookieOptions: ISessionGenericCookieOptions = {
  signed: true,
  sameSite: 'Lax',
  httpOnly: true,
  secure: true,
  maxAge: 600000, // 10 minutes
  domain: process.env.FQDN,
};

export default {
  encryptionKey: env.string('USERINFO_CRYPT_KEY'),
  prefix: 'FCP-LOW-SESS:',
  cookieOptions,
  cookieSecrets: env.json('COOKIE_SECRETS'),
  sessionCookieName: 'fc_session_id',
  lifetime: 600, // 10 minutes
  sessionIdLength: 64,
  excludedRoutes: [],
} as SessionGenericConfig;
