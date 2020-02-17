import { Module } from '@nestjs/common';
import { ConsentManagementService } from './consent-management.service';

@Module({
  providers: [ConsentManagementService],
  exports: [ConsentManagementService],
})
export class ConsentManagementModule {}
