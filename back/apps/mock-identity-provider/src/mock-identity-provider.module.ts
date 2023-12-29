/* istanbul ignore file */

// Declarative code
import { Global, MiddlewareConsumer, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { AsyncLocalStorageModule } from '@fc/async-local-storage';
import { ConfigService, ConfigTemplateInterceptor } from '@fc/config';
import { ExceptionsModule } from '@fc/exceptions';
import {
  OidcProviderGrantService,
  OidcProviderModule,
} from '@fc/oidc-provider';
import {
  ServiceProviderAdapterEnvModule,
  ServiceProviderAdapterEnvService,
} from '@fc/service-provider-adapter-env';
import { SessionConfig, SessionMiddleware, SessionModule } from '@fc/session';

import {
  MockIdentityProviderController,
  OidcProviderController,
} from './controllers';
import { MockIdentityProviderSession } from './dto';
import {
  MockIdentityProviderService,
  OidcProviderConfigAppService,
  OidcProviderMiddlewareService,
  ScenariosService,
} from './services';

const exceptionModule = ExceptionsModule.withoutTracking();
@Global()
@Module({
  imports: [
    exceptionModule,
    AsyncLocalStorageModule,
    ServiceProviderAdapterEnvModule,
    SessionModule.forRoot({
      schema: MockIdentityProviderSession,
    }),
    OidcProviderModule.register(
      OidcProviderConfigAppService,
      ServiceProviderAdapterEnvService,
      ServiceProviderAdapterEnvModule,
      exceptionModule,
    ),
  ],
  controllers: [MockIdentityProviderController, OidcProviderController],
  providers: [
    MockIdentityProviderService,
    OidcProviderConfigAppService,
    OidcProviderGrantService,
    OidcProviderMiddlewareService,
    ScenariosService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ConfigTemplateInterceptor,
    },
  ],
  exports: [OidcProviderConfigAppService],
})
export class MockIdentityProviderModule {
  constructor(private readonly config: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    const { excludedRoutes } = this.config.get<SessionConfig>('Session');

    consumer
      .apply(SessionMiddleware)
      .exclude(...excludedRoutes)
      .forRoutes('*');
  }
}
