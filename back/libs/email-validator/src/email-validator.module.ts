import { singleValidationFactory } from '@gouvfr-lasuite/proconnect.debounce/api';

import { type DynamicModule, Module } from '@nestjs/common';

import { ConfigService } from '@fc/config';

import type { EmailValidatorConfig } from './dto';
import { EmailValidatorService } from './services';
import { SINGLE_VALIDATION_TOKEN } from './tokens';

@Module({})
export class EmailValidatorModule {
  static register(configPaths: string): DynamicModule {
    return {
      exports: [EmailValidatorService, SINGLE_VALIDATION_TOKEN],
      module: EmailValidatorModule,
      providers: [
        EmailValidatorService,
        {
          provide: SINGLE_VALIDATION_TOKEN,
          inject: [ConfigService],
          useFactory: (config: ConfigService) => {
            const { debounceApiKey } =
              config.get<EmailValidatorConfig>(configPaths) ?? {};
            return debounceApiKey
              ? singleValidationFactory(debounceApiKey)
              : () =>
                  Promise.resolve({
                    send_transactional: '1',
                  });
          },
        },
      ],
    };
  }
}
