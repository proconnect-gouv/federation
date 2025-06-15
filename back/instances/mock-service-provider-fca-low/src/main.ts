import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as session from 'express-session';
import { chain, isObject } from 'lodash';
import * as path from 'node:path';
import * as process from 'node:process';
import * as client from 'openid-client-v6';

import { decrypt } from './decrypt';

declare module 'express-session' {
  export interface SessionData {
    userinfo?: any;
    userdata?: any;
    idtoken?: any;
    oauth2token?: any;
    nonce?: string;
    state?: string;
    id_token_hint?: string;
    code_verifier?: string;
  }
}

const HOST = `https://${process.env.FQDN}`;
const PORT = parseInt(process.env.PORT, 10) || 3000;
const SITE_TITLE = process.env.APP_NAME;
const STYLESHEET_URL =
  process.env.STYLESHEET_URL || 'https://unpkg.com/bamboo.css';
const CALLBACK_URL = '/oidc-callback';
const PC_CLIENT_ID = process.env.IdentityProviderAdapterEnv_CLIENT_ID;
const PC_CLIENT_SECRET = decrypt(
  process.env.IdentityProviderAdapterEnv_CLIENT_SECRET,
  process.env.IdentityProviderAdapterEnv_CLIENT_SECRET_CIPHER_PASS,
);
const PC_PROVIDER = process.env.IdentityProviderAdapterEnv_DISCOVERY_URL;
const PC_SCOPES = process.env.OidcClient_SCOPE;
const LOGIN_HINT = '';
const PC_ID_TOKEN_SIGNED_RESPONSE_ALG =
  process.env.IdentityProviderAdapterEnv_ID_TOKEN_SIGNED_RESPONSE_ALG;
const PC_USERINFO_SIGNED_RESPONSE_ALG =
  process.env.IdentityProviderAdapterEnv_USERINFO_SIGNED_RESPONSE_ALG;
const dataProviderConfigs: { name: string; url: string; secret: string }[] =
  JSON.parse(process.env.App_DATA_APIS);

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/'));
app.use(
  session({
    name: 'session',
    secret: 'pas_hyper_secret',
    rolling: true,
  }),
);
app.enable('trust proxy');

const objToUrlParams = (obj) =>
  new URLSearchParams(
    chain(obj)
      .omitBy((v) => !v)
      .mapValues((o) => (isObject(o) ? JSON.stringify(o) : o))
      .value(),
  );

const getCurrentUrl = (req) =>
  new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);

const getProviderConfig = async () => {
  const config = await client.discovery(
    new URL(PC_PROVIDER),
    PC_CLIENT_ID,
    {
      id_token_signed_response_alg: PC_ID_TOKEN_SIGNED_RESPONSE_ALG,
      userinfo_signed_response_alg: PC_USERINFO_SIGNED_RESPONSE_ALG || null,
    },
    client.ClientSecretPost(PC_CLIENT_SECRET),
  );
  return config;
};

const AUTHORIZATION_DEFAULT_PARAMS = {
  redirect_uri: `${HOST}${CALLBACK_URL}`,
  scope: PC_SCOPES,
  login_hint: LOGIN_HINT || null,
  claims: {
    id_token: {
      amr: null,
    },
  },
};

app.get('/', (req, res, next) => {
  try {
    res.render('index', {
      title: SITE_TITLE,
      stylesheetUrl: STYLESHEET_URL,
      userinfo: JSON.stringify(req.session.userinfo, null, 2),
      idtoken: JSON.stringify(req.session.idtoken, null, 2),
      oauth2token: JSON.stringify(req.session.oauth2token, null, 2),
      userdata: JSON.stringify(req.session.userdata, null, 2),
      defaultParamsValue: JSON.stringify(AUTHORIZATION_DEFAULT_PARAMS, null, 2),
    });
  } catch (e) {
    next(e);
  }
});

const getAuthorizationControllerFactory = (
  extraParams = {},
  usePkce = false,
) => {
  return async (req, res, next) => {
    try {
      const config = await getProviderConfig();
      const nonce = client.randomNonce();
      const state = client.randomState();
      let code_verifier, code_challenge;

      req.session.state = state;
      req.session.nonce = nonce;

      let pkceParams = {};
      if (usePkce) {
        // Deterministic code_verifier for testing purposes, not to be used in production
        code_verifier =
          'code_verifier_1234567890123456789012345678901234567890';
        code_challenge = await client.calculatePKCECodeChallenge(code_verifier);
        req.session.code_verifier = code_verifier;
        pkceParams = {
          code_challenge,
          code_challenge_method: 'S256',
        };
      }

      const redirectUrl = client.buildAuthorizationUrl(
        config,
        objToUrlParams({
          nonce,
          state,
          ...AUTHORIZATION_DEFAULT_PARAMS,
          ...pkceParams,
          ...extraParams,
        }),
      );

      res.redirect(redirectUrl);
    } catch (e) {
      next(e);
    }
  };
};

app.post('/login', getAuthorizationControllerFactory());
app.post('/login-pkce', getAuthorizationControllerFactory({}, true));

app.post(
  '/custom-connection',
  bodyParser.urlencoded({ extended: false }),
  (req, res, next) => {
    const customParams = JSON.parse(req.body['custom-params']);

    return getAuthorizationControllerFactory(customParams)(req, res, next);
  },
);

app.get(CALLBACK_URL, async (req, res, next) => {
  try {
    const config = await getProviderConfig();
    const currentUrl = getCurrentUrl(req);
    const tokens = await client.authorizationCodeGrant(config, currentUrl, {
      expectedNonce: req.session.nonce,
      expectedState: req.session.state,
      pkceCodeVerifier: req.session.code_verifier,
    });

    req.session.nonce = null;
    req.session.state = null;
    req.session.code_verifier = null;
    const claims = tokens.claims();
    req.session.userinfo = await client.fetchUserInfo(
      config,
      tokens.access_token,
      claims.sub,
    );
    req.session.idtoken = claims;
    req.session.id_token_hint = tokens.id_token;
    req.session.oauth2token = tokens;
    res.redirect('/');
  } catch (e) {
    console.error(e);
    next(e);
  }
});

app.post('/logout', async (req, res, next) => {
  try {
    const id_token_hint = req.session.id_token_hint;
    await new Promise((resolve) => req.session.destroy(resolve));
    const config = await getProviderConfig();
    const redirectUrl = client.buildEndSessionUrl(
      config,
      objToUrlParams({
        post_logout_redirect_uri: `${HOST}/`,
        id_token_hint,
      }),
    );

    res.redirect(redirectUrl.toString());
  } catch (e) {
    next(e);
  }
});

app.post(
  '/revoke-token',
  bodyParser.urlencoded({ extended: false }),
  async (req, res, next) => {
    try {
      const config = await getProviderConfig();
      await client.tokenRevocation(
        config,
        req.session?.oauth2token?.access_token,
      );
      res.redirect('/');
    } catch (e) {
      console.error(e);
      next(e);
    }
  },
);

app.post('/fetch-userinfo', async (req, res, next) => {
  try {
    const config = await getProviderConfig();
    req.session.userinfo = await client.fetchUserInfo(
      config,
      req.session?.oauth2token?.access_token,
      req.session?.idtoken?.sub,
    );
    res.redirect('/');
  } catch (e) {
    console.error(e);
    next(e);
  }
});

app.post('/fetch-userdata', async (req, res, next) => {
  try {
    const encodedAccessToken = Buffer.from(
      req.session?.oauth2token?.access_token,
      'utf-8',
    ).toString('base64');
    const userdataPromises = dataProviderConfigs.map(
      // eslint-disable-next-line max-nested-callbacks
      async ({ name, url, secret }) => {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${encodedAccessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // Input data for the mock-data-provider endpoint
            // eslint-disable-next-line @typescript-eslint/naming-convention
            auth_secret: secret,
          }),
        });
        return {
          name,
          response: await response.json(),
        };
      },
    );
    req.session.userdata = await Promise.all(userdataPromises);

    res.redirect('/');
  } catch (e) {
    console.error(e);
    next(e);
  }
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
