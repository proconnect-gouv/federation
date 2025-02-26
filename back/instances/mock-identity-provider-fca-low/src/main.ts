import * as express from 'express';
import { urlencoded } from 'express';
import { strict as assert } from 'node:assert';
import * as path from 'node:path';
import Provider from 'oidc-provider-v8';

import configuration from './oidc-provider-support/configuration';
import MemoryAdapter from './oidc-provider-support/memory_adapter.js';
import { createUser, getDefaultUser } from './user-data';

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

// eslint-disable-next-line complexity
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
        acr: params?.acr_values?.split(' ')[0] || 'eidas1',
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

app.post(
  '/interaction/:uid/login',
  urlencoded({ extended: false }),
  async (req, res, next) => {
    try {
      const {
        prompt: { name },
      } = await provider.interactionDetails(req, res);
      assert.equal(name, 'login');
      const { acr, ...userAttributes } = req.body;
      const userId = createUser(userAttributes);

      const result = {
        login: {
          accountId: userId,
          acr,
          // the user is considered to have just logged in
          ts: Date.now(),
          // the user is considered to have logged with a password
          amr: ['pwd'],
        },
      };

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
