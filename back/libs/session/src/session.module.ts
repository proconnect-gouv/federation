/* istanbul ignore file */

// Declarative code
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { RedisModule } from '@fc/redis';
import { CryptographyModule } from '@fc/cryptography';
import { SessionService } from './session.service';
import { SessionInterceptor } from './session.interceptor';

@Module({
  imports: [RedisModule, CryptographyModule],
  providers: [
    SessionService,
    {
      provide: APP_INTERCEPTOR,
      useClass: SessionInterceptor,
    },
  ],
  exports: [SessionService, RedisModule, CryptographyModule],
})
export class SessionModule {}
