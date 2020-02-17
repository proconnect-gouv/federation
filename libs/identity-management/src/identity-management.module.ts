import { Module } from '@nestjs/common';
import { IdentityManagementService } from './identity-management.service';

@Module({
  providers: [IdentityManagementService],
  exports: [IdentityManagementService],
})
export class IdentityManagementModule {}
