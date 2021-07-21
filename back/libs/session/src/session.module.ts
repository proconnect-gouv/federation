/* istanbul ignore file */

// Declarative code
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DynamicModule, Module } from '@nestjs/common';
import { RedisModule } from '@fc/redis';
import { CryptographyModule } from '@fc/cryptography';
import { SESSION_TOKEN_OPTIONS } from './tokens';
import { SessionInterceptor } from './interceptors';
import { ISessionOptions } from './interfaces';
import { SessionCsrfService, SessionService } from './services';

@Module({})
export class SessionModule {
  static forRoot(options: ISessionOptions): DynamicModule {
    return {
      global: true,
      module: SessionModule,
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
        SessionService,
        SessionCsrfService,
      ],
      exports: [
        SessionService,
        SessionCsrfService,
        RedisModule,
        CryptographyModule,
      ],
    };
  }
}
