import { Module, DynamicModule, Provider } from '@nestjs/common';

import { MAILER_MODULE_OPTIONS } from './mailer.constant';
import {
  IMailerOptionsFactory,
  IMailerModuleAsyncOptions,
  IMailerModuleOptions,
} from './interfaces';
import { MailerService } from './mailer.service';
import { createTransporterProvider } from './mailer.providers';

@Module({
  providers: [MailerService],
  exports: [MailerService, MAILER_MODULE_OPTIONS],
})
export class MailerModule {
  public static forRoot(options: IMailerModuleOptions): DynamicModule {
    return {
      module: MailerModule,
      providers: createTransporterProvider(options),
    };
  }

  public static forRootAsync(
    options: IMailerModuleAsyncOptions,
  ): DynamicModule {
    return {
      module: MailerModule,
      providers: this.createAsyncProviders(options),
    };
  }

  private static createAsyncProviders(
    options: IMailerModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: IMailerModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: MAILER_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    return {
      provide: MAILER_MODULE_OPTIONS,
      useFactory: async (optionsFactory: IMailerOptionsFactory) =>
        await optionsFactory.createMailerOptions(),
      inject: [options.useExisting || options.useClass],
    };
  }
}
