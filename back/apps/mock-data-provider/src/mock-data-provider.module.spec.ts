import { Test } from '@nestjs/testing';

import { ConfigModule } from '@fc/config';
import { LoggerModule } from '@fc/logger';

import { getConfigMock } from '@mocks/config';

import { MockDataProviderModule } from './mock-data-provider.module';

describe('MockDataProviderModule Dependency Validation', () => {
  it('should compile successfully with minimal config', async () => {
    const configServiceMock = getConfigMock();
    configServiceMock.get.mockImplementation(
      (key: string) =>
        ({
          Logger: { threshold: 'info' },
          Jwt: {
            secretOrPublicKey: 'test-secret',
            signOptions: { expiresIn: '1h' },
          },
        })[key] || {},
    );

    const moduleFixture = await Test.createTestingModule({
      imports: [
        MockDataProviderModule,
        ConfigModule.forRoot(configServiceMock as any),
        LoggerModule.forRoot([]),
      ],
    }).compile();

    expect(moduleFixture).toBeDefined();
    expect(moduleFixture.get(MockDataProviderModule)).toBeDefined();
  });
});
