import { Module } from '@nestjs/common';
import { SpManagementService } from './sp-management.service';

@Module({
  providers: [SpManagementService],
  exports: [SpManagementService],
})
export class SpManagementModule {}
