import { Module } from '@nestjs/common';

import { ApacheIgniteModule } from '@fc/apache-ignite';
/**
 * Import from `/services` to avoid circular dependency
 * (this module is imported in @fc/eidas-bridge)
 */
import { CryptographyModule } from '@fc/cryptography';
import { EidasBridgeTrackingService } from '@fc/eidas-bridge/services';
import { EidasLightProtocolModule } from '@fc/eidas-light-protocol';
import { TrackingModule } from '@fc/tracking';

import { EidasProviderController } from './eidas-provider.controller';
import { EidasProviderService } from './eidas-provider.service';

const trackingModule = TrackingModule.forRoot(EidasBridgeTrackingService);

@Module({
  imports: [
    ApacheIgniteModule,
    CryptographyModule,
    EidasLightProtocolModule,
    trackingModule,
  ],
  providers: [EidasProviderService],
  exports: [EidasProviderService],
  controllers: [EidasProviderController],
})
export class EidasProviderModule {}
