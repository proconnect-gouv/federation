import { Module } from '@nestjs/common';
import { RedisModule } from '@fc/redis';
import { CryptographyModule } from '@fc/cryptography';
import { IdentityService } from './identity.service';

@Module({
  imports: [RedisModule, CryptographyModule],
  providers: [IdentityService],
  exports: [IdentityService, RedisModule, CryptographyModule],
})
export class IdentityModule {}
