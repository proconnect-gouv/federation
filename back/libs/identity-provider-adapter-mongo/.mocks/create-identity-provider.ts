import type { INestApplicationContext } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import type { Model } from "mongoose";

import { IdentityProviderAdapterMongoService } from "../src/identity-provider-adapter-mongo.service";
import type { IdentityProvider } from "../src/schemas";

/**
 * Seeds an Identity Provider in the database and refreshes the cache
 *
 * @param app - NestJS application context
 * @param data - Identity Provider data
 * @returns The created Identity Provider document
 */
export async function createIdentityProvider(
  app: INestApplicationContext,
  data: Partial<IdentityProvider>,
): Promise<IdentityProvider> {
  const IdentityProviderModel = app.get<Model<IdentityProvider>>(
    getModelToken("IdentityProvider"),
  );
  const identityProviderAdapterMongoService = app.get(
    IdentityProviderAdapterMongoService,
  );

  const identityProvider = await IdentityProviderModel.create(data);

  await identityProviderAdapterMongoService.refreshCache();

  return identityProvider;
}

/**
 * `active`/`title` (and any other DTO-only field, e.g.
 * `attachedEmailDomains` — pass via `extra`) aren't declared on the
 * `IdentityProvider` mongoose schema even though real provider
 * documents carry them and the DTO requires/accepts them —
 * schema/DTO drift, not a test-only concern.
 * `createIdentityProvider`'s typed `.create()` call can't write
 * undeclared fields under `strict: true`, so this bypasses the
 * schema via a raw collection write to seed a genuinely active IdP.
 */
export async function createActiveIdentityProvider(
  app: INestApplicationContext,
  data: Partial<IdentityProvider>,
  extra: Record<string, unknown> = {},
): Promise<IdentityProvider> {
  const identityProvider = await createIdentityProvider(app, data);

  const IdentityProviderModel = app.get<Model<IdentityProvider>>(
    getModelToken("IdentityProvider"),
  );
  await IdentityProviderModel.collection.updateOne(
    { uid: data.uid },
    { $set: { active: true, title: data.name, ...extra } },
  );

  await app.get(IdentityProviderAdapterMongoService).refreshCache();

  return identityProvider;
}
