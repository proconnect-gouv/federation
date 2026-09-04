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

  const provider = new Provider(`https://${config.FQDN}`, {
    adapter: MemoryAdapter,
    ...configuration(config),
  });
  provider.proxy = true;

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
        defaultAttributes: {
          email,
          given_name: defaultUser.given_name,
          usual_name: defaultUser.usual_name,
          siret: defaultUser.siret,
          sub: defaultUser.sub,
          phone_number: defaultUser.phone_number,
          acr,
          amr,
        },
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

  function parseAttributesJson(raw: unknown): Record<string, unknown> {
    if (typeof raw !== "string" || raw.trim() === "") return {};

    try {
      const parsed = JSON.parse(raw);
      if (
        typeof parsed !== "object" ||
        parsed === null ||
        Array.isArray(parsed)
      ) {
        throw new Error("Le JSON doit représenter un objet");
      }
      return parsed as Record<string, unknown>;
    } catch (err) {
      throw new Error(
        `Impossible de parser le champ "attributes" : ${(err as Error).message}`,
      );
    }
  }

  async function normalLogin(req: Request, res: Response) {
    const {
      prompt: { name },
    } = await provider.interactionDetails(req, res);
    assert.equal(name, "login");

    const { error, error_description, ...formFields } = req.body;
    const attributes = parseAttributesJson(req.body["attributes"]);
    const { acr, amr, ...userAttributes } = loginBodySchema.parse({
      ...formFields,
      ...attributes,
    });
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
        result = await normalLogin(req, res);
      }

      await provider.interactionFinished(req, res, result);
    },
  );

  app.post(
    "/interaction/:uid/login/advanced",
    urlencoded({ extended: false }),
    async (req, res) => {
      let result;
      try {
        result = await advancedLogin(req, res);
      } catch (err) {
        result = {
          error: "invalid_request",
          error_description: (err as Error).message,
        };
      }
      await provider.interactionFinished(req, res, result);
    },
  );

  app.use(provider.callback());

  async function advancedLogin(req: Request, res: Response) {
    const {
      prompt: { name },
    } = await provider.interactionDetails(req, res);
    assert.equal(name, "login");

    const attributes = parseAttributesJson(req.body["attributes"]);
    const { acr, amr, ...userAttributes } = loginBodySchema.parse(attributes);
    const userId = createUser(userAttributes);

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
      loginResult.acr = parseFormDataValue(acr);
    }

    if (amr !== "") {
      loginResult.amr = amr.split(",");
    }

    return {
      login: loginResult,
      consent: {},
    };
  }

  return { app };
}
