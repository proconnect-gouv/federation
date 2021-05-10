/* istanbul ignore file */

// Declarative code
import { Module } from '@nestjs/common';
import { RabbitmqModule } from '@fc/rabbitmq';
import { OidcProviderModule } from '@fc/oidc-provider';
import {
  OverrideOidcProviderService,
  JoseOverrideService,
  CryptoOverrideService,
} from './services';

@Module({
  imports: [OidcProviderModule, RabbitmqModule.registerFor('Cryptography')],
  providers: [
    OverrideOidcProviderService,
    JoseOverrideService,
    CryptoOverrideService,
  ],
  exports: [OverrideOidcProviderService],
})
export class OverrideOidcProviderModule {}
