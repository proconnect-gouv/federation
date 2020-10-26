/* istanbul ignore file */

// Declarative code
import { Module } from '@nestjs/common';
import { CoreService } from './services';

@Module({
  providers: [CoreService],
  exports: [CoreService],
})
export class CoreModule {}
