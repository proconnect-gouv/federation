import { Test } from '@nestjs/testing';

import { ConfigModule } from '@fc/config';
import { LoggerModule } from '@fc/logger';

import { getConfigMock } from '@mocks/config';

import { BridgeHttpProxyModule } from './bridge-http-proxy.module';

describe('BridgeHttpProxyModule Dependency Validation', () => {
  it('should compile successfully with minimal config', async () => {
    const configServiceMock = getConfigMock();
    configServiceMock.get.mockReturnValue({ threshold: 'info' });

    const moduleFixture = await Test.createTestingModule({
      imports: [
        BridgeHttpProxyModule,
        ConfigModule.forRoot(configServiceMock as any),
        LoggerModule.forRoot([]),
      ],
    }).compile();

    expect(moduleFixture).toBeDefined();
    expect(moduleFixture.get(BridgeHttpProxyModule)).toBeDefined();
  });
});
