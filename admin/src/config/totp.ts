export default {
  algorithm: process.env.TOTP_ALGO || 'sha1',
  window: 1,
};
