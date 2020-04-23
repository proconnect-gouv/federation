import { Module } from '@nestjs/common';
import {
  CryptographyService,
  CryptoOverrideService,
  JoseOverrideService,
} from './services';
import { RabbitmqModule } from '@fc/rabbitmq';

@Module({
  imports: [RabbitmqModule.registerFor('Cryptography')],
  providers: [CryptographyService, CryptoOverrideService, JoseOverrideService],
  exports: [CryptographyService],
})
export class CryptographyModule {}
