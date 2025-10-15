import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { RouteInfo } from '@nestjs/common/interfaces';

import { ConsoleModule } from 'nestjs-console';
import { memoryStorage } from 'multer';
import { resolve } from 'path';
import { ConfigModule, ConfigService } from 'nestjs-config';
import * as otplib from 'otplib';

import { AppController } from './app.controller';
import { IdentityProviderModule } from './identity-provider/identity-provider.module';
import { LocalsInterceptor } from './meta/locals.interceptor';
import { IdentityProviderController } from './identity-provider/identity-provider.controller';
import { ServiceProviderModule } from './service-provider/service-provider.module';
import { ServiceProviderController } from './service-provider/service-provider.controller';
import { ConfigurationModule } from './configuration/configuration.module';
import { ConfigurationController } from './configuration/configuration.controller';
import { ScopesController } from './scopes/scopes.controller';

import { AppContextMiddleware } from './app-context/middleware/app-context.middleware';
import { AccountModule } from './account/account.module';
import { AccountController } from './account/account.controller';
import { AuthenticationModule } from './authentication/authentication.module';
import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticatedMiddleware } from './authentication/middleware/authenticated.middleware';
import { CliModule } from './cli/cli.module';
import { CsurfMiddleware } from '@nest-middlewares/csurf';
import { TotpMiddleware } from './authentication/middleware/totp.middleware';
import { LoggerModule } from './logger/logger.module';

const otplibProvider = {
  provide: 'otplib',
  useValue: otplib,
};

@Module({
  imports: [
    AuthenticationModule,
    ConsoleModule,
    CliModule,
    IdentityProviderModule,
    ServiceProviderModule,
    AccountModule,
    LoggerModule,
    ConfigurationModule,
    ConfigModule.load(resolve(__dirname, 'config', '**/!(*.d).{ts,js}')),
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => config.get('database'),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => config.get('mongo-database'),
      inject: [ConfigService],
      name: 'fc-mongo',
    }),
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  providers: [LocalsInterceptor, otplibProvider],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {
    CsurfMiddleware.configure({});
    consumer
      .apply(AppContextMiddleware, AuthenticatedMiddleware, CsurfMiddleware)
      .forRoutes(
        AppController,
        IdentityProviderController,
        ServiceProviderController,
        AccountController,
        ConfigurationController,
        ScopesController,
      );

    consumer.apply(CsurfMiddleware).forRoutes(AuthenticationController);

    consumer.apply(AppContextMiddleware).forRoutes({
      path: '/account/enrollment',
      method: RequestMethod.PATCH,
    });

    const totpAccount = [
      {
        path: '/account/create',
        method: RequestMethod.POST,
      },
      {
        path: '/account/enrollment',
        method: RequestMethod.PATCH,
      },
      {
        path: '/account/:key',
        method: RequestMethod.DELETE,
      },
      {
        path: '/account/update-account/:username',
        method: RequestMethod.PATCH,
      },
    ];

    const totpIdentityProvider = [
      {
        path: '/identity-provider/create',
        method: RequestMethod.POST,
      },
      {
        path: '/identity-provider/:id',
        method: RequestMethod.PATCH,
      },
      {
        path: '/identity-provider/:id',
        method: RequestMethod.DELETE,
      },
    ];

    const totpServiceProvider = [
      {
        path: '/service-provider/update/:id/secret',
        method: RequestMethod.PATCH,
      },
      {
        path: '/service-provider/create',
        method: RequestMethod.POST,
      },
      {
        path: '/service-provider/delete',
        method: RequestMethod.POST,
      },
      {
        path: '/service-provider/:id',
        method: RequestMethod.PATCH,
      },
      {
        path: '/service-provider/:key',
        method: RequestMethod.DELETE,
      },
    ];

    const totpScopes = [
      {
        path: '/scopes/label/create',
        method: RequestMethod.POST,
      },
      {
        path: '/scopes/label/update/:id',
        method: RequestMethod.PATCH,
      },
      {
        path: '/scopes/label/delete/:id',
        method: RequestMethod.DELETE,
      },
    ];

    const totpRoutes: RouteInfo[] = [
      ...totpAccount,
      ...totpIdentityProvider,
      ...totpServiceProvider,
      ...totpScopes,
      {
        path: '/configuration/indisponibilite',
        method: RequestMethod.POST,
      },
      { path: '/login', method: RequestMethod.POST },
      {
        path: '/notification/create',
        method: RequestMethod.POST,
      },
      {
        path: '/notification/:id',
        method: RequestMethod.PATCH,
      },
    ];

    consumer.apply(TotpMiddleware).forRoutes(...totpRoutes);
  }
}
