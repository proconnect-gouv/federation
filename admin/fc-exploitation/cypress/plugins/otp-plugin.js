const { authenticator } = require('otplib');

const MIN_REMAINING_TIME = 5;

async function generateTotp(key){
  return new Promise((resolve) => {
    const ttl = authenticator.timeRemaining();
    // If TOTP expires in less than 5 seconds
    // we'll wait for the next timeframe
    // in order to be sure to have a valid TOTP
    // at the time the form is submited
    const wait = ttl < MIN_REMAINING_TIME ? ttl + 1 : 0;

    setTimeout(() => {
      resolve(authenticator.generate(key));
    }, wait * 1000);
  });
}

function getTotp(args) {
  const { secret } = args;
  return generateTotp(secret);
}

module.exports = { getTotp };