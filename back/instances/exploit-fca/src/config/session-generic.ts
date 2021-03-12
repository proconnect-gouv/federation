/* istanbul ignore file */

// Tested by DTO
import { SessionGenericConfig } from '@fc/session-generic';

export default {
  encryptionKey: process.env.USERINFO_CRYPT_KEY,
  prefix: 'EIDAS-BRIDGE-SESS:',
  cookieOptions: {
    signed: true,
    sameSite: 'Strict',
    httpOnly: true,
    secure: true,
    maxAge: 600000, // 10 minutes
    domain: process.env.FQDN,
  },
  cookieSecrets: JSON.parse(process.env.SESSION_COOKIE_SECRETS),
  sessionCookieName: 'eidas_session_id',
  lifetime: 600, // 10 minutes
  sessionIdLength: 64,
  excludedRoutes: [],
} as SessionGenericConfig;
