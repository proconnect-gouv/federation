import { Module } from '@nestjs/common';
import { RedisModule } from '@fc/redis';
import { IdentityManagementService } from './identity-management.service';

@Module({
  imports: [RedisModule],
  providers: [IdentityManagementService],
  exports: [IdentityManagementService, RedisModule],
})
export class IdentityManagementModule {}
