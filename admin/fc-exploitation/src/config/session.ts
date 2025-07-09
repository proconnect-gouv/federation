export default {
  secret: process.env.SESSION_SECRET || 'aufooquewooleng8Thahr6quei7Ais',
  name: process.env.SESSION_NAME || 'sessionId',
  resave: true,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    domain: process.env.VIRTUAL_HOST,
    path: '/',
    httpOnly: true,
    secure: true,
    maxAge: process.env.SESSION_TTL || 60 * 10 * 1000, // 10 minutes
    sameSite: 'Strict',
  },
};
