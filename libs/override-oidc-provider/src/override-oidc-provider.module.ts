import { Module, DynamicModule } from '@nestjs/common';
import { RabbitmqModule } from '@fc/rabbitmq';
import {
  OverrideOidcProviderService,
  JoseOverrideService,
  CryptoOverrideService,
} from './services';

@Module({})
export class OverrideOidcProviderModule {
  static register(oidcProviderModule: DynamicModule): DynamicModule {
    return {
      module: OverrideOidcProviderModule,
      imports: [oidcProviderModule, RabbitmqModule.registerFor('Cryptography')],
      providers: [
        OverrideOidcProviderService,
        JoseOverrideService,
        CryptoOverrideService,
      ],
      exports: [OverrideOidcProviderService],
    };
  }
}
