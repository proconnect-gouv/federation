import express, { urlencoded, type Request, type Response } from "express";
import { get } from "lodash-es";
import { strict as assert } from "node:assert";
import { Provider } from "oidc-provider";
import { z } from "zod";
import type { EnvConfig } from "./config.ts";
import configuration from "./oidc-provider-support/configuration.ts";
import MemoryAdapter from "./oidc-provider-support/memory_adapter.ts";
import {
  createUser,
  getDefaultUser,
  parseFormDataValue,
  userAttributesSchema,
} from "./user-data.ts";
import type { UserAttributes } from "./user-data.ts";

export type { EnvConfig };

const loginBodySchema = userAttributesSchema.extend({
  acr: z.string().optional().default(""),
  amr: z.string().optional().default(""),
});

export function createApp(config: EnvConfig) {
  const app = express();

  app.set("view engine", "ejs");
  app.set("views", import.meta.dirname);
  app.enable("trust proxy");

  app.get("/livez", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/readyz", (_req, res) => {
    res.json({ status: "ok" });
  });

  const customClaimNames = new Set<string>();

  const createProvider = () => {
    const providerConfig = configuration(config);
    // We let users add custom fields in advanced login mode to simulate
    // custom IdP user info properties.
    // Reusing the default `openid` scope lets us carry them without adding
    // admin-facing configuration just for the mock.
    const openidClaims = [...(providerConfig.claims?.["openid"] ?? [])];

    customClaimNames.forEach((claimName) => {
      openidClaims.push(claimName);
    });

    providerConfig.claims = {
      ...providerConfig.claims,
      openid: openidClaims,
    };

    const provider = new Provider(`https://${config.FQDN}`, {
      adapter: MemoryAdapter,
      ...providerConfig,
    });
    provider.proxy = true;
    return provider;
  };

  let provider = createProvider();

  const registerCustomClaims = (userAttributes: Record<string, unknown>) => {
    Object.keys(userAttributes).forEach((claimName) => {
      if (
        !customClaimNames.has(claimName) &&
        ![
          "email",
          "given_name",
          "usual_name",
          "siret",
          "sub",
          "phone_number",
          "acr",
          "amr",
        ].includes(claimName)
      ) {
        customClaimNames.add(claimName);
        provider = createProvider();
      }
    });
  };

  app.get("/interaction/:uid", async (req, res, next) => {
    const { uid, prompt, params, session } = await provider.interactionDetails(
      req,
      res,
    );

    const client = await provider.Client.find(params["client_id"] as string);

    const defaultUser = getDefaultUser();

    if (prompt.name === "login") {
      const acr =
        get(prompt.details, "acr.value") ||
        get(prompt.details, "acr.values.0") ||
        (params?.["acr_values"] as string | undefined)?.split(" ")[0] ||
        "eidas1";
      const amr = "pwd";
      const email = params?.["login_hint"] || defaultUser.email;

      return res.render("index", {
        title: config.APP_NAME,
        stylesheetUrl: config.STYLESHEET_URL,
        uid,
        email,
        defaultUser,
        acr,
        amr,
        defaultParamsValue: JSON.stringify(
          {
            email,
            given_name: defaultUser.given_name,
            usual_name: defaultUser.usual_name,
            siret: defaultUser.siret,
            sub: defaultUser.sub,
            phone_number: defaultUser.phone_number,
            acr,
            amr,
          },
          null,
          2,
        ),
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

    return next(new Error("unsupported_prompt"));
  });

  async function handleBasicLogin(req: Request, res: Response) {
    const {
      prompt: { name },
    } = await provider.interactionDetails(req, res);
    assert.equal(name, "login");
    const { acr, amr, ...userAttributes } = loginBodySchema.parse(req.body);
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

    if (acr !== "") {
      loginResult.acr = parseFormDataValue(acr);
    }

    if (amr !== "") {
      loginResult.amr = amr.split(",");
    }

    const result = {
      login: loginResult,
      // skip the consent
      consent: {},
    };
    return result;
  }
  app.post(
    "/interaction/:uid/login",
    urlencoded({ extended: false }),
    async (req, res) => {
      let result;
      if (req.body["error"]) {
        result = req.body;
      } else {
        result = await handleBasicLogin(req, res);
      }

      await provider.interactionFinished(req, res, result);
    },
  );

  app.post(
    "/interaction/:uid/advanced-login",
    urlencoded({ extended: false }),

    async (req, res) => {
      let result;
      try {
        result = await handleAdvancedLogin(req, res);
      } catch (err) {
        result = {
          error: "invalid_request",
          error_description: (err as Error).message,
        };
      }
      await provider.interactionFinished(req, res, result);
    },
  );

  app.use((req, res, _next) => {
    return provider.callback()(req, res);
  });

  async function handleAdvancedLogin(req: Request, res: Response) {
    const {
      prompt: { name },
    } = await provider.interactionDetails(req, res);
    assert.equal(name, "login");

    const advancedLoginParams = JSON.parse(
      req.body["advanced-login-params"] as string,
    ) as Record<string, unknown>;

    const { acr, amr, ...userAttributes } = advancedLoginParams;
    const userId = createUser(userAttributes as UserAttributes);
    registerCustomClaims(userAttributes);

    const loginResult: {
      accountId: string;
      acr?: any;
      amr?: string[];
      ts: number;
    } = {
      accountId: userId,
      ts: Date.now(),
    };

    if (acr !== "") {
      loginResult.acr = parseFormDataValue(acr as string);
    }

    if (amr !== "") {
      loginResult.amr = (amr as string).split(",");
    }

    console.log("loginResult:", loginResult);

    return {
      login: loginResult,
      consent: {},
    };
  }

  return { app };
}
