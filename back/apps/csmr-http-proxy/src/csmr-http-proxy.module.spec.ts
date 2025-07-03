import { Test } from '@nestjs/testing';

import { ConfigModule } from '@fc/config';
import { LoggerModule } from '@fc/logger';

import { getConfigMock } from '@mocks/config';

import { CsmrHttpProxyModule } from './csmr-http-proxy.module';

describe('CsmrHttpProxyModule Dependency Validation', () => {
  it('should compile successfully with minimal config', async () => {
    const configServiceMock = getConfigMock();
    configServiceMock.get.mockImplementation(
      (key: string) =>
        ({
          Logger: { threshold: 'info' },
          HttpProxyBroker: { requestTimeout: 5000 },
        })[key] || {},
    );

    const moduleFixture = await Test.createTestingModule({
      imports: [
        CsmrHttpProxyModule,
        ConfigModule.forRoot(configServiceMock as any),
        LoggerModule.forRoot([]),
      ],
    }).compile();

    expect(moduleFixture).toBeDefined();
    expect(moduleFixture.get(CsmrHttpProxyModule)).toBeDefined();
  });
});
