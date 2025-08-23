const { authenticator } = require('otplib');

function getTotp(args) {
  const { secret } = args;
  return authenticator.generate(secret);
}

module.exports = { getTotp };
