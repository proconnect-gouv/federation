import type { INestApplicationContext } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import type { ServiceProvider } from '../src/schemas';
import { ServiceProviderAdapterMongoService } from '../src/service-provider-adapter-mongo.service';

/**
 * Seeds a Service Provider in the database and refreshes the cache
 *
 * @param app - NestJS application context
 * @param data - Service Provider data
 * @returns The created Service Provider document
 *
 * @example
 * ```typescript
 * // Using FSA1 data
 * await createServiceProvider(app, Fsa1ServiceProviderDocument);
 *
 * // Using FSA1 data with overrides
 * await createServiceProvider(app, { ...Fsa1ServiceProviderDocument, key: 'custom-key' });
 *
 * // Using completely custom data
 * await createServiceProvider(app, customServiceProviderData);
 * ```
 */
export async function createServiceProvider(
  app: INestApplicationContext,
  data: Partial<ServiceProvider>,
): Promise<ServiceProvider> {
  const ServiceProviderModel = app.get<Model<ServiceProvider>>(
    getModelToken('ServiceProvider'),
  );
  const serviceProviderAdapterMongoService = app.get(
    ServiceProviderAdapterMongoService,
  );

  const serviceProvider = await ServiceProviderModel.create(data);

  await serviceProviderAdapterMongoService.refreshCache();

  return serviceProvider;
}
