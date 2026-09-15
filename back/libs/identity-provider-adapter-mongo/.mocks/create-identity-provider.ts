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
