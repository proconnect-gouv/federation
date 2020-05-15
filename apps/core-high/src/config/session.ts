import { SessionConfig } from '@fc/session';

export default {
  secret: process.env.SESSION_SECRET,
  name: process.env.SESSION_NAME,
  ttl: parseInt(process.env.SESSION_TTL, 10),
} as SessionConfig;
