import { Module, DynamicModule } from '@nestjs/common';
import { ConfigService } from './config.service';
import { CONFIG_OPTIONS } from './tokens';
import { IConfigOptions } from './interfaces';

@Module({})
export class ConfigModule {
  // does not need to be tested
  // istanbul ignore next
  static forRoot(options: IConfigOptions): DynamicModule {
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
