import { Module } from '@nestjs/common';
import { FakeHsmService } from './fake-hsm.service';

@Module({
  providers: [FakeHsmService],
  exports: [FakeHsmService],
})
export class FakeHsmModule {}
