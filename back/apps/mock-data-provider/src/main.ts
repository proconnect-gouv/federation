import * as express from 'express';
import { importJWK, JWK } from 'jose-v6';
import * as crypto from 'node:crypto';
import { JsonWebKey } from 'node:crypto';
import * as process from 'node:process';
import * as client from 'openid-client-v6';

/* eslint-disable @typescript-eslint/naming-convention */
const {
  DataProviderAdapterCore_CHECKTOKEN_JWT_ENCRYPTED_RESPONSE_ALG: encryptAlg,
  DataProviderAdapterCore_CHECKTOKEN_JWT_ENCRYPTED_RESPONSE_ENC: encryptEnc,
  DataProviderAdapterCore_CHECKTOKEN_JWT_SIGNED_RESPONSE_ALG: signAlg,
  DataProviderAdapterCore_CLIENT_ID,
  DataProviderAdapterCore_CLIENT_SECRET,
  DataProviderAdapterCore_ISSUER,
  DataProviderAdapterCore_JWKS: rawJwks,
  PORT,
} = process.env;
/* eslint-enable @typescript-eslint/naming-convention */

const port = parseInt(PORT, 10) || 3000;
const jwks: JWK[] = rawJwks ? JSON.parse(rawJwks) : [];
let keys: CryptoKey[];
let publicJwks: JsonWebKey[];

const app = express();

const getProviderConfig = async () => {
  const config = await client.discovery(
    new URL(DataProviderAdapterCore_ISSUER),
    DataProviderAdapterCore_CLIENT_ID,
    {
      introspection_signed_response_alg: signAlg,
    },
    client.ClientSecretPost(DataProviderAdapterCore_CLIENT_SECRET),
  );

  client.enableDecryptingResponses(config, [encryptEnc], ...keys);
  return config;
};

app.get('/api/v1/jwks', (req, res, _next) => {
  return res.json({ keys: publicJwks });
});

app.get('/api/v1/data', async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const rawAccessToken = authorizationHeader.split(' ')[1];
    const accessToken = Buffer.from(rawAccessToken, 'base64').toString('utf-8');

    const config = await getProviderConfig();

    const introspectionResponse = await client.tokenIntrospection(
      config,
      accessToken,
    );

    return res.json({ token_introspection: introspectionResponse });
  } catch (e) {
    next(e);
  }
});

app.use((req, res, _next) => {
  res.status(404).json({
    status: 404,
    message: 'Not found',
  });
});

app.use((err, req, res, _next) => {
  console.error(err);

  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message,
  });
});

app.listen(port, async () => {
  const relevantJwks = jwks.filter((jwk) => jwk.alg === encryptAlg);

  keys = (await Promise.all(
    relevantJwks.map((jwk) => importJWK(jwk)),
  )) as CryptoKey[];

  publicJwks = relevantJwks.map((jwk) =>
    crypto
      .createPublicKey({ key: jwk as JsonWebKey, format: 'jwk' })
      .export({ format: 'jwk' }),
  );

  console.log(`App listening on port ${port}`);
});
