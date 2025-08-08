export default {
  algorithm: process.env.TOTP_ALGO || 'sha1',
  window: process.env.TOTP_WINDOW === 'loose' ? 1 : 0,
};
