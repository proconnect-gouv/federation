import express, { urlencoded } from 'express';
import { rateLimit } from 'express-rate-limit';
import { get } from 'lodash';
import { strict as assert } from 'node:assert';
import path from 'node:path';
import Provider from 'oidc-provider-v8';

import configuration from './oidc-provider-support/configuration';
import MemoryAdapter from './oidc-provider-support/memory_adapter.js';
import { createUser, getDefaultUser, parseFormDataValue } from './user-data';

const {
  PORT = 3000,
  FQDN,
  STYLESHEET_URL = 'https://cdn.jsdelivr.net/gh/raj457036/attriCSS@master/themes/brightlight-green.css',
  APP_NAME,
} = process.env;

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/'));
app.enable('trust proxy');

const provider = new Provider(`https://${FQDN}`, {
  adapter: MemoryAdapter,
  ...configuration,
});
provider.proxy = true;

const rateLimiter = rateLimit({
  windowMs: 900000, // 15 minutes
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  ipv6Subnet: 56,
});

app.use(rateLimiter);

app.get('/interaction/:uid', async (req, res, next) => {
  try {
    const { uid, prompt, params, session } = await provider.interactionDetails(
      req,
      res,
    );

    const client = await provider.Client.find(params.client_id);

    const defaultUser = getDefaultUser();

    if (prompt.name === 'login') {
      return res.render('index', {
        title: APP_NAME,
        stylesheetUrl: STYLESHEET_URL,
        uid,
        email: params?.login_hint || defaultUser.email,
        defaultUser,
        acr:
          get(prompt.details, 'acr.value') ||
          get(prompt.details, 'acr.values.0') ||
          params?.acr_values?.split(' ')[0] ||
          'eidas1',
        amr: 'pwd',
        debugInfo: JSON.stringify(
          {
            oidcProviderPrompt: prompt,
            oidcProviderParams: params,
            oidcProviderSession: session,
            oidcProviderClient: client,
          },
          null,
          2,
        ),
      });
    }

    return next(new Error('unsupported_prompt'));
  } catch (err) {
    return next(err);
  }
});

async function normalLogin(req, res) {
  const {
    prompt: { name },
  } = await provider.interactionDetails(req, res);
  assert.equal(name, 'login');
  const { acr, amr, ...userAttributes } = req.body;
  const userId = createUser(userAttributes);

  const loginResult: {
    accountId: string;
    acr?: any;
    amr?: string[];
    ts: number;
  } = {
    accountId: userId,
    // the user is considered to have just logged in
    ts: Date.now(),
  };

  if (acr !== '') {
    loginResult.acr = parseFormDataValue(acr);
  }

  if (amr !== '') {
    loginResult.amr = amr.split(',');
  }

  const result = {
    login: loginResult,
    // skip the consent
    consent: {},
  };
  return result;
}

app.post(
  '/interaction/:uid/login',
  urlencoded({ extended: false }),
  async (req, res, next) => {
    try {
      let result;
      if (req.body['error']) {
        result = req.body;
      } else {
        result = await normalLogin(req, res);
      }

      await provider.interactionFinished(req, res, result);
    } catch (err) {
      next(err);
    }
  },
);

app.use(provider.callback());

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
