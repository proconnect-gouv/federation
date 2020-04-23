import { Module } from '@nestjs/common';
import { ConsentService } from './consent.service';

@Module({
  providers: [ConsentService],
  exports: [ConsentService],
})
export class ConsentModule {}
