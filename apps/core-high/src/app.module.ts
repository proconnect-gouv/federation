import { Module } from '@nestjs/common';
import { CoreFcpModule } from '@fc/core-fcp';

@Module({
  imports: [CoreFcpModule],
})
export class AppModule {}
