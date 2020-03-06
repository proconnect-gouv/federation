import { Module, DynamicModule } from '@nestjs/common';
import { ConfigService } from './config.service';
import { CONFIG_OPTIONS } from './tokens';
import { IConfigOptions } from './interfaces';

@Module({})
export class ConfigModule {
  static forRoot(options: IConfigOptions): DynamicModule {
    // does not need to be tested
    // istanbul ignore next
    return {
      global: options.isGlobal,
      module: ConfigModule,
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        ConfigService,
      ],
      exports: [ConfigService],
    };
  }
}
