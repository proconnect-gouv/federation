import { SessionConfig } from '@fc/session';

export default {
  cryptographyKey: process.env.USERINFO_CRYPT_KEY,
  prefix: 'FCP-SESS:',
  cookieOptions: {
    signed: true,
    sameSite: 'Strict',
    httpOnly: true,
    secure: true,
    maxAge: 600000, // 10 minutes
    domain: process.env.FQDN,
  },
  cookieSecrets: JSON.parse(process.env.SESSION_COOKIE_SECRETS),
  sessionCookieName: 'fc_session_id',
  interactionCookieName: 'fc_interaction_id',
} as SessionConfig;
