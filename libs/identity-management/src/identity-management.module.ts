import { Module } from '@nestjs/common';
import { RedisModule } from '@fc/redis';
import { CryptographyModule } from '@fc/cryptography';
import { IdentityManagementService } from './identity-management.service';

@Module({
  imports: [RedisModule, CryptographyModule],
  providers: [IdentityManagementService],
  exports: [IdentityManagementService, RedisModule, CryptographyModule],
})
export class IdentityManagementModule {}
