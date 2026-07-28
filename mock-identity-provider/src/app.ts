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
      return res.render("index", {
        title: config.APP_NAME,
        stylesheetUrl: config.STYLESHEET_URL,
        uid,
        email: params?.["login_hint"] || defaultUser.email,
        defaultUser,
        acr:
          get(prompt.details, "acr.value") ||
          get(prompt.details, "acr.values.0") ||
          (params?.["acr_values"] as string | undefined)?.split(" ")[0] ||
          "eidas1",
        amr: "pwd",
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

  async function normalLogin(req: Request, res: Response) {
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
        result = await normalLogin(req, res);
      }

      await provider.interactionFinished(req, res, result);
    },
  );

  app.use(provider.callback());

  return { app };
}
