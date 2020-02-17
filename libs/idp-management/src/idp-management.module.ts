import { Module } from '@nestjs/common';
import { IdPManagementService } from './idp-management.service';

@Module({
  providers: [IdPManagementService],
  exports: [IdPManagementService],
})
export class IdPmanagementModule {}
