/* istanbul ignore file */
import { FeatureHandlerNoHandler } from './handlers';

// Declarative code
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  providers: [FeatureHandlerNoHandler],
  exports: [FeatureHandlerNoHandler],
})
export class FeatureHandlerModule {}
