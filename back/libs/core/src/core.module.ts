/* istanbul ignore file */

// Declarative code
import { Module } from '@nestjs/common';
import { ServiceProviderModule } from '@fc/service-provider';
import { SessionModule } from '@fc/session';
import { TrackingModule } from '@fc/tracking';
import { CoreService } from './services';

@Module({
  imports: [ServiceProviderModule, SessionModule, TrackingModule.forLib()],
  providers: [CoreService],
  exports: [CoreService],
})
export class CoreModule {}
