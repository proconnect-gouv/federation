/* istanbul ignore file */

// Declarative code
import { Module } from '@nestjs/common';
import { ServiceProviderAdapterMongoModule } from '@fc/service-provider-adapter-mongo';
import { SessionGenericModule } from '@fc/session-generic';
import { TrackingModule } from '@fc/tracking';
import { CoreService } from './services';

@Module({
  imports: [
    ServiceProviderAdapterMongoModule,
    SessionGenericModule,
    TrackingModule.forLib(),
  ],
  providers: [CoreService],
  exports: [CoreService],
})
export class CoreModule {}
