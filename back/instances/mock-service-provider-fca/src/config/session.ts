/* istanbul ignore file */

// Tested by DTO
import { SessionConfig } from '@fc/session';

export default {
  cryptographyKey: process.env.USERINFO_CRYPT_KEY,
  prefix: 'FCA-IDP-SESS:',
  cookieOptions: {
    signed: true,
    sameSite: 'Lax',
    httpOnly: true,
    secure: true,
    maxAge: 600000, // 10 minutes
    domain: process.env.FQDN,
  },
  cookieSecrets: JSON.parse(process.env.SESSION_COOKIE_SECRETS),
  sessionCookieName: 'sp_session_id',
  interactionCookieName: 'sp_interaction_id',
  lifetime: 600, // 10 minutes
  sessionIdLength: 64,
} as SessionConfig;
