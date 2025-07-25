const fs = require('fs');
const { JWK } = require('jose-v2');

/**
 * Execute this function to generate the JSON Object Signing and Encryption
 * from
 * @param {string} path of the local pem file, Ex: ./ec-secp256r1.pem
 * @param {string} kid
 * @param {enum('sig','enc')} use for what purpose either enc = encoding or sig = signature.
 * @param {0|1} is the key private, either 0 = no, 1 = yes.
 * @returns
 */
async function pemToJwk(path, kid, use, alg, private) {
  const pem = fs.readFileSync(path);
  const key = JWK.asKey(pem, {
    kid,
    use,
    alg,
  });

  return JSON.stringify(key.toJWK(private));
}

if (process.argv.length < 6) {
  console.log(`
  Missing arguments!
  Usage: 
  > node pemToJwk.js <path/to/key.pem> <kid> <use(sig|enc)> <private? (0|1)>

  Exemple 1, generate pub sig key:
  > node pemToJwk.js <path/to/key.pem> <kid> sig RSA-OAEP-256 0

  Exemple 2, generate private enc key:
  > node pemToJwk.js <path/to/key.pem> <kid> enc ECDH-ES 1
`);
  process.exit(1);
}

const [, , pemFilePath, kid, use, alg, private = false] = process.argv;

pemToJwk(pemFilePath, kid, use, alg, !!parseInt(private)).then(console.log);
