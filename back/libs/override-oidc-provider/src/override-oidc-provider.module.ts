/* istanbul ignore file */

// Declarative code
import { DynamicModule, Module } from '@nestjs/common';

import { RabbitmqModule } from '@fc/rabbitmq';

import { CryptoOverrideService, OverrideOidcProviderService } from './services';

@Module({})
export class OverrideOidcProviderModule {
  static register(oidcProviderModule: DynamicModule): DynamicModule {
    return {
      module: OverrideOidcProviderModule,
      imports: [oidcProviderModule, RabbitmqModule.registerFor('Cryptography')],
      providers: [OverrideOidcProviderService, CryptoOverrideService],
      exports: [OverrideOidcProviderService],
    };
  }
}
