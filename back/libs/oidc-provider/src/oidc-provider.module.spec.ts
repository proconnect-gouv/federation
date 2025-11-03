import { Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { ConfigModule } from '@fc/config';
import { LoggerModule, LoggerService } from '@fc/logger';

import { getConfigMock } from '@mocks/config';
import { getLoggerMock } from '@mocks/logger';

import { OidcProviderModule } from './oidc-provider.module';

class MockIdentityProviderAdapterService {
  getById = jest.fn();
  getList = jest.fn();
  isActiveById = jest.fn();
  refreshCache = jest.fn();
}

class MockServiceProviderAdapterService {
  getById = jest.fn();
  getList = jest.fn();
}

@Module({
  providers: [
    MockIdentityProviderAdapterService,
    MockServiceProviderAdapterService,
  ],
  exports: [
    MockIdentityProviderAdapterService,
    MockServiceProviderAdapterService,
  ],
})
class MockIdentityProviderAdapterModule {}

@Module({
  providers: [MockServiceProviderAdapterService],
  exports: [MockServiceProviderAdapterService],
})
class MockServiceProviderAdapterModule {}

describe('OidcProviderModule Dependency Validation', () => {
  it('should compile successfully with minimal config', async () => {
    const configServiceMock = getConfigMock();
    const loggerMock = getLoggerMock();
    configServiceMock.get.mockReturnValue({ threshold: 'info' });

    const compiledModule = await Test.createTestingModule({
      imports: [
        OidcProviderModule.register(
          MockIdentityProviderAdapterService,
          MockIdentityProviderAdapterModule,
          MockServiceProviderAdapterService,
          MockServiceProviderAdapterModule,
        ),
        ConfigModule.forRoot(configServiceMock as any),
        LoggerModule.forRoot([]),
      ],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .compile();

    expect(compiledModule).toBeDefined();
    expect(compiledModule.get(OidcProviderModule)).toBeDefined();
  });
});
