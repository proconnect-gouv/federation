import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { importJWK } from "jose";
import type { JWK } from "jose";
import crypto from "node:crypto";
import type { JsonWebKey } from "node:crypto";
import { z } from "zod";
import * as client from "openid-client";

export const envSchema = z.object({
  DataProviderAdapterCore_CHECKTOKEN_JWT_ENCRYPTED_RESPONSE_ALG: z
    .string()
    .min(1),
  DataProviderAdapterCore_CHECKTOKEN_JWT_ENCRYPTED_RESPONSE_ENC: z
    .string()
    .min(1),
  DataProviderAdapterCore_CHECKTOKEN_JWT_SIGNED_RESPONSE_ALG: z.string().min(1),
  DataProviderAdapterCore_CLIENT_ID: z.string().min(1),
  DataProviderAdapterCore_CLIENT_SECRET: z.string().min(1),
  DataProviderAdapterCore_ISSUER: z.string().url(),
  DataProviderAdapterCore_JWKS: z
    .string()
    .optional()
    .default("[]")
    .transform((s) => JSON.parse(s) as JWK[]),
  PORT: z.coerce.number().int().positive().optional().default(3000),
});

export type EnvConfig = z.infer<typeof envSchema>;

export async function createApp(config: EnvConfig) {
  const relevantJwks = config.DataProviderAdapterCore_JWKS.filter(
    (jwk) =>
      jwk.alg ===
      config.DataProviderAdapterCore_CHECKTOKEN_JWT_ENCRYPTED_RESPONSE_ALG,
  );

  const privateKeys = (await Promise.all(
    relevantJwks.map((jwk) => importJWK(jwk)),
  )) as CryptoKey[];

  const publicJwks = relevantJwks.map((jwk) =>
    crypto
      .createPublicKey({ key: jwk as JsonWebKey, format: "jwk" })
      .export({ format: "jwk" }),
  );

  const getProviderConfig = async () => {
    const c = await client.discovery(
      new URL(config.DataProviderAdapterCore_ISSUER),
      config.DataProviderAdapterCore_CLIENT_ID,
      {
        introspection_signed_response_alg:
          config.DataProviderAdapterCore_CHECKTOKEN_JWT_SIGNED_RESPONSE_ALG,
      },
      client.ClientSecretPost(config.DataProviderAdapterCore_CLIENT_SECRET),
    );

    client.enableDecryptingResponses(
      c,
      [config.DataProviderAdapterCore_CHECKTOKEN_JWT_ENCRYPTED_RESPONSE_ENC],
      ...privateKeys,
    );
    return c;
  };

  //

  const app = express();

  app.get("/livez", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/readyz", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/v1/jwks", (_req, res, _next) => {
    res.json({ keys: publicJwks });
  });

  app.get("/api/v1/data", async (req, res, next) => {
    try {
      const accessToken = z
        .string()
        .startsWith("Bearer ")
        .transform((h) => Buffer.from(h.slice(7), "base64").toString("utf-8"))
        .parse(req.headers.authorization);

      res.json({
        token_introspection: await client.tokenIntrospection(
          await getProviderConfig(),
          accessToken,
        ),
      });
    } catch (e) {
      next(e);
    }
  });

  app.use((_req, res, _next) => {
    res.status(404).json({
      status: 404,
      message: "Not found",
    });
  });

  app.use(
    (
      err: Error & { status?: number },
      _req: Request,
      res: Response,
      _next: NextFunction,
    ) => {
      console.error(err);

      res.status(err.status ?? 500).json({
        status: err.status ?? 500,
        message: err.message,
      });
    },
  );

  return { app };
}
