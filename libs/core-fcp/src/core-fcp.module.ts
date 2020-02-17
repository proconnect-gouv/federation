import { Module } from '@nestjs/common';
import { CoreFcpController } from './core-fcp.controller';
import { CoreFcpService } from './core-fcp.service';

@Module({
  controllers: [CoreFcpController],
  providers: [CoreFcpService],
})
export class CoreFcpModule {}
