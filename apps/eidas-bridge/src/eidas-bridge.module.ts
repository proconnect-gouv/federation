/* istanbul ignore file */

// Declarative code
import { Module, Global } from '@nestjs/common';
import { EidasBridgeController } from './controllers';

@Global()
@Module({
  imports: [],
  controllers: [EidasBridgeController],
  providers: [],
  // Make `CoreFcpTrackingService` dependencies available
  exports: [],
})
export class EidasBridgeModule {}
