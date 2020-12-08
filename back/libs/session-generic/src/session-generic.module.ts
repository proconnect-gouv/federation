/* istanbul ignore file */

// Declarative code
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DynamicModule, Module } from '@nestjs/common';
import { RedisModule } from '@fc/redis';
import { CryptographyModule } from '@fc/cryptography';
import { SESSION_TOKEN_OPTIONS } from './tokens';
import { SessionInterceptor } from './interceptors';
import { ISessionGenericOptions } from './interfaces';
import { SessionGenericService } from './session-generic.service';

@Module({})
export class SessionGenericModule {
  static forRoot(options: ISessionGenericOptions): DynamicModule {
    return {
      global: true,
      module: SessionGenericModule,
      imports: [RedisModule, CryptographyModule],
      providers: [
        {
          provide: SESSION_TOKEN_OPTIONS,
          useValue: options,
        },
        {
          provide: APP_INTERCEPTOR,
          useClass: SessionInterceptor,
        },
        SessionGenericService,
      ],
      exports: [SessionGenericService, RedisModule, CryptographyModule],
    };
  }
}
