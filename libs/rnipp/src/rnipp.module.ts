import { Module } from '@nestjs/common';
import { RnippService } from './rnipp.service';

@Module({
  providers: [RnippService],
  exports: [RnippService],
})
export class RnippModule {}
