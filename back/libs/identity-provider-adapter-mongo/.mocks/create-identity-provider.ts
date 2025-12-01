import type { INestApplicationContext } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import type { IdentityProvider } from '../src/schemas';
import { IdentityProviderAdapterMongoService } from '../src/identity-provider-adapter-mongo.service';

/**
 * Seeds an Identity Provider in the database and refreshes the cache
 *
 * @param app - NestJS application context
 * @param data - Identity Provider data
 * @returns The created Identity Provider document
 *
 * @example
 * ```typescript
 * // Using MonComptePro data
 * await createIdentityProvider(app, MonCompteProIdentityProviderDocument);
 *
 * // Using MonComptePro data with overrides
 * await createIdentityProvider(app, { ...MonCompteProIdentityProviderDocument, uid: 'custom-uid' });
 *
 * // Using completely custom data
 * await createIdentityProvider(app, customIdentityProviderData);
 * ```
 */
export async function createIdentityProvider(
  app: INestApplicationContext,
  data: Partial<IdentityProvider>,
): Promise<IdentityProvider> {
  const IdentityProviderModel = app.get<Model<IdentityProvider>>(
    getModelToken('IdentityProvider'),
  );
  const identityProviderAdapterMongoService = app.get(
    IdentityProviderAdapterMongoService,
  );

  const identityProvider = await IdentityProviderModel.create(data);

  await identityProviderAdapterMongoService.refreshCache();

  return identityProvider;
}
