import bodyParser from "body-parser";
import express from "express";
import type { RequestHandler } from "express";
import session from "express-session";
import { chain, isObject } from "lodash-es";
import { z } from "zod";
import * as client from "openid-client";
import { decrypt } from "./decrypt.ts";

declare module "express-session" {
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

export const envSchema = z.object({
  APP_NAME: z.string().optional(),
  FQDN: z.string().min(1),
  PORT: z.coerce.number().int().positive().optional().default(3000),
  STYLESHEET_URL: z.string().optional().default("https://unpkg.com/bamboo.css"),
  IdentityProviderAdapterEnv_CLIENT_ID: z.string().min(1),
  IdentityProviderAdapterEnv_CLIENT_SECRET: z.string().min(1),
  IdentityProviderAdapterEnv_CLIENT_SECRET_CIPHER_PASS: z.string().min(1),
  IdentityProviderAdapterEnv_DISCOVERY_URL: z.string().url(),
  IdentityProviderAdapterEnv_ID_TOKEN_SIGNED_RESPONSE_ALG: z
    .string()
    .optional(),
  IdentityProviderAdapterEnv_USERINFO_SIGNED_RESPONSE_ALG: z
    .string()
    .optional(),
  App_DATA_APIS: z
    .string()
    .min(1)
    .transform((s) => JSON.parse(s) as { name: string; url: string }[]),
  ACR_VALUES_FOR_2FA: z
    .string()
    .optional()
    .default(
      "eidas0-mfa eidas1-mfa eidas2 eidas3 https://proconnect.gouv.fr/assurance/self-asserted-2fa https://proconnect.gouv.fr/assurance/consistency-checked-2fa",
    ),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function createApp(config: EnvConfig) {
  const HOST = `https://${config.FQDN}`;
  const CALLBACK_URL = "/oidc-callback";
  const PC_CLIENT_ID = config.IdentityProviderAdapterEnv_CLIENT_ID;
  const PC_CLIENT_SECRET = decrypt(
    config.IdentityProviderAdapterEnv_CLIENT_SECRET,
    config.IdentityProviderAdapterEnv_CLIENT_SECRET_CIPHER_PASS,
  );
  const PC_PROVIDER = config.IdentityProviderAdapterEnv_DISCOVERY_URL;
  const PC_SCOPES =
    "openid uid given_name usual_name email siren siret organizational_unit belonging_population phone chorusdt idp_id idp_acr custom roles organization_label";
  const LOGIN_HINT = "";
  const PC_ID_TOKEN_SIGNED_RESPONSE_ALG =
    config.IdentityProviderAdapterEnv_ID_TOKEN_SIGNED_RESPONSE_ALG;
  const PC_USERINFO_SIGNED_RESPONSE_ALG =
    config.IdentityProviderAdapterEnv_USERINFO_SIGNED_RESPONSE_ALG;
  const dataProviderConfigs = config.App_DATA_APIS;

  const app = express();

  app.get("/livez", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/readyz", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.set("view engine", "ejs");
  app.set("views", import.meta.dirname);
  app.use(
    session({
      name: "session",
      secret: "pas_hyper_secret",
      rolling: true,
    }),
  );
  app.enable("trust proxy");

  const objToUrlParams = (obj: Record<string, unknown>): URLSearchParams =>
    new URLSearchParams(
      chain(obj)
        .omitBy((v) => !v)
        .mapValues((o) => (isObject(o) ? JSON.stringify(o) : String(o)))
        .value() as Record<string, string>,
    );

  const getCurrentUrl = (req: express.Request): URL =>
    new URL(`${req.protocol}://${req.get("host")}${req.originalUrl}`);

  const getProviderConfig = async (): Promise<client.Configuration> => {
    return client.discovery(
      new URL(PC_PROVIDER),
      PC_CLIENT_ID,
      {
        id_token_signed_response_alg: PC_ID_TOKEN_SIGNED_RESPONSE_ALG,
        userinfo_signed_response_alg:
          PC_USERINFO_SIGNED_RESPONSE_ALG ?? undefined,
      },
      client.ClientSecretPost(PC_CLIENT_SECRET),
    );
  };

  const AUTHORIZATION_DEFAULT_PARAMS = {
    redirect_uri: `${HOST}${CALLBACK_URL}`,
    scope: PC_SCOPES,
    login_hint: LOGIN_HINT || undefined,
    claims: {
      id_token: {
        amr: null,
      },
    },
  };

  app.get("/", (req, res) => {
    res.render("index", {
      title: config.APP_NAME,
      stylesheetUrl: config.STYLESHEET_URL,
      userinfo: JSON.stringify(req.session.userinfo, null, 2),
      idtoken: JSON.stringify(req.session.idtoken, null, 2),
      oauth2token: JSON.stringify(req.session.oauth2token, null, 2),
      userdata: JSON.stringify(req.session.userdata, null, 2),
      defaultParamsValue: JSON.stringify(AUTHORIZATION_DEFAULT_PARAMS, null, 2),
    });
  });

  const getAuthorizationControllerFactory = (
    extraParams: Record<string, unknown> = {},
  ): RequestHandler => {
    return async (req, res) => {
      const providerConfig = await getProviderConfig();
      const nonce = client.randomNonce();
      const state = client.randomState();

      req.session.state = state;
      req.session.nonce = nonce;

      const redirectUrl = client.buildAuthorizationUrl(
        providerConfig,
        objToUrlParams({
          nonce,
          state,
          ...AUTHORIZATION_DEFAULT_PARAMS,
          ...extraParams,
        }),
      );

      res.redirect(redirectUrl.href);
    };
  };

  app.post("/login", getAuthorizationControllerFactory());
  app.post("/login-pkce", async (req, res, next) => {
    const extraParams: Record<string, unknown> = {};

    const code_verifier = client.randomPKCECodeVerifier();
    const code_challenge =
      await client.calculatePKCECodeChallenge(code_verifier);
    req.session.code_verifier = code_verifier;
    extraParams.code_challenge = code_challenge;
    extraParams.code_challenge_method = "S256";

    return getAuthorizationControllerFactory(extraParams)(req, res, next);
  });

  app.post(
    "/custom-connection",
    bodyParser.urlencoded({ extended: false }),
    (req, res, next) => {
      const customParams = JSON.parse(
        req.body["custom-params"] as string,
      ) as Record<string, unknown>;

      return getAuthorizationControllerFactory(customParams)(req, res, next);
    },
  );

  app.get(CALLBACK_URL, async (req, res) => {
    const providerConfig = await getProviderConfig();
    const currentUrl = getCurrentUrl(req);
    const tokens = await client.authorizationCodeGrant(
      providerConfig,
      currentUrl,
      {
        expectedNonce: req.session.nonce,
        expectedState: req.session.state,
        pkceCodeVerifier: req.session.code_verifier,
      },
    );

    req.session.nonce = undefined;
    req.session.state = undefined;
    req.session.code_verifier = undefined;
    const claims = tokens.claims()!;
    req.session.userinfo = await client.fetchUserInfo(
      providerConfig,
      tokens.access_token!,
      claims.sub,
    );
    req.session.idtoken = claims;
    req.session.id_token_hint = tokens.id_token;
    req.session.oauth2token = tokens;
    res.redirect("/");
  });

  app.post(
    "/logout",
    bodyParser.urlencoded({ extended: false }),
    async (req, res) => {
      const id_token_hint = req.session.id_token_hint;
      await new Promise<void>((resolve) =>
        req.session.destroy(() => resolve()),
      );
      const providerConfig = await getProviderConfig();
      const paramObject: Record<string, string | null> = {
        id_token_hint: id_token_hint ?? null,
        post_logout_redirect_uri: null,
      };
      if ((req.body as { no_redirect?: string })?.no_redirect !== "true") {
        paramObject.post_logout_redirect_uri = `${HOST}/`;
      }
      const redirectUrl = client.buildEndSessionUrl(
        providerConfig,
        objToUrlParams(paramObject),
      );

      res.redirect(redirectUrl.toString());
    },
  );

  app.post("/refresh-token", async (req, res) => {
    const providerConfig = await getProviderConfig();
    const tokens = await client.refreshTokenGrant(
      providerConfig,
      req.session?.oauth2token?.refresh_token as string,
    );
    const claims = tokens.claims();
    req.session.idtoken = claims;
    req.session.id_token_hint = tokens.id_token;
    req.session.oauth2token = tokens;
    res.redirect("/");
  });

  app.post("/revoke-token", async (req, res) => {
    const providerConfig = await getProviderConfig();
    await client.tokenRevocation(
      providerConfig,
      req.session?.oauth2token?.access_token as string,
    );
    res.redirect("/");
  });

  app.post("/fetch-userinfo", async (req, res) => {
    const providerConfig = await getProviderConfig();
    req.session.userinfo = await client.fetchUserInfo(
      providerConfig,
      req.session?.oauth2token?.access_token as string,
      req.session?.idtoken?.sub as string,
    );
    res.redirect("/");
  });

  app.post("/fetch-userdata", async (req, res) => {
    const encodedAccessToken = Buffer.from(
      req.session?.oauth2token?.access_token as string,
      "utf-8",
    ).toString("base64");
    const userdataPromises = dataProviderConfigs.map(async ({ name, url }) => {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${encodedAccessToken}`,
          "Content-Type": "application/json",
        },
      });
      return {
        name,
        response: await response.json(),
      };
    });
    req.session.userdata = await Promise.all(userdataPromises);

    res.redirect("/");
  });

  app.post(
    "/force-2fa",
    getAuthorizationControllerFactory({
      claims: {
        id_token: {
          amr: null,
          acr: {
            essential: true,
            values: config.ACR_VALUES_FOR_2FA.split(" "),
          },
        },
      },
    }),
  );

  app.use(
    (
      err: unknown,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      console.error(err);
      res.status(500).send(err instanceof Error ? err.stack : String(err));
    },
  );

  return { app };
}
