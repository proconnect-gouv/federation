import { Module } from '@nestjs/common';
import { SPManagementService } from './sp-management.service';

@Module({
  providers: [SPManagementService],
  exports: [SPManagementService],
})
export class SPManagementModule {}
