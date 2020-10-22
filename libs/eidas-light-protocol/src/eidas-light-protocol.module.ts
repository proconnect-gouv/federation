/* istanbul ignore file */

// Declarative code
import { Module } from '@nestjs/common';
import { LightRequestService } from './services';

@Module({
  providers: [LightRequestService],
  exports: [LightRequestService],
})
export class EidasLightProtocolModule { }
