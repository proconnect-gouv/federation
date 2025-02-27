import { Test } from '@nestjs/testing';

import { ConfigModule } from '@fc/config';
import { LoggerModule, LoggerService } from '@fc/logger';

import { getConfigMock } from '@mocks/config';
import { getLoggerMock } from '@mocks/logger';

import { EmailValidatorModule } from './email-validator.module';
import { SINGLE_VALIDATION_TOKEN } from './tokens';

describe(EmailValidatorModule.name, () => {
  it('should register a EmailValidatorService', async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(getConfigMock()),
        EmailValidatorModule.register('🦋'),
        LoggerModule.forRoot(),
      ],
    })
      .overrideProvider(LoggerService)
      .useValue(getLoggerMock())
      .compile();

    const singleValidation = module.get(SINGLE_VALIDATION_TOKEN);

    expect(singleValidation).toBeDefined();
    expect(singleValidation).toBeInstanceOf(Function);
  });

  it('should return a mocked function if debounceApiKey is not provided', async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(getConfigMock()),
        EmailValidatorModule.register('🦋'),
        LoggerModule.forRoot(),
      ],
    })
      .overrideProvider(LoggerService)
      .useValue(getLoggerMock())
      .compile();

    const singleValidation = module.get(SINGLE_VALIDATION_TOKEN);

    await expect(singleValidation('foo')).resolves.toEqual({
      send_transactional: '1',
    });
  });

  it('❎ fails with the wrong debounceApiKey', async () => {
    const configService = getConfigMock();
    configService.get.mockReturnValueOnce({
      debounceApiKey: '🪀',
    });
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(configService),
        EmailValidatorModule.register('🦋'),
        LoggerModule.forRoot(),
      ],
    })
      .overrideProvider(LoggerService)
      .useValue(getLoggerMock())
      .compile();

    const singleValidation = module.get(SINGLE_VALIDATION_TOKEN);

    await expect(singleValidation('📧')).toReject();
  });
});
