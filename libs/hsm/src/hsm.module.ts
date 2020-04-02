import { Module, Global } from '@nestjs/common';
import { HsmService } from './hsm.service';

@Global()
@Module({
  providers: [HsmService],
  exports: [HsmService],
})
export class HsmModule {}
