/* istanbul ignore file */

// Tested by DTO
import { SessionConfig } from '@fc/session';

/**
 * The "session" library is deprecated in favor of "session-generic" who does not depends
 * of the openid environment.
 */

export default {
  cryptographyKey: process.env.USERINFO_CRYPT_KEY,
  prefix: 'EIDAS-BRIDGE-SESS-DEPRECATED:',
  cookieOptions: {
    signed: true,
    sameSite: 'Strict',
    httpOnly: true,
    secure: true,
    maxAge: 600000, // 10 minutes
    domain: process.env.FQDN,
  },
  cookieSecrets: JSON.parse(process.env.SESSION_COOKIE_SECRETS),
  sessionCookieName: 'eidas_session_deprecated_id',
  interactionCookieName: 'eidas_interaction_deprecated_id',
  lifetime: 600, // 10 minutes
  sessionIdLength: 64,
} as SessionConfig;
