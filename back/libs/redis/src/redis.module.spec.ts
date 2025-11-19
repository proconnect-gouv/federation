import { Test } from '@nestjs/testing';

import { ConfigModule } from '@fc/config';
import { LoggerService } from '@fc/logger';

import { getConfigMock } from '@mocks/config';
import { getLoggerMock } from '@mocks/logger';

import { RedisModule } from './redis.module';

describe('RedisModule Dependency Validation', () => {
  it('should compile successfully with minimal config', async () => {
    const configServiceMock = getConfigMock();
    const loggerMock = getLoggerMock();
    configServiceMock.get.mockReturnValue({ threshold: 'info' });

    const compiledModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(configServiceMock as any), RedisModule],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .compile();

    const app = await compiledModule.init();

    await app.close();
  });
});
