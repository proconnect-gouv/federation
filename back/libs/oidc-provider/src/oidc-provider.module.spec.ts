import { Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { ConfigModule } from '@fc/config';
import { LoggerModule } from '@fc/logger';

import { getConfigMock } from '@mocks/config';

import { OidcProviderRenderedJsonExceptionFilter } from './filters';
import { OidcProviderModule } from './oidc-provider.module';
import { OIDC_PROVIDER_CONFIG_APP_TOKEN } from './tokens';

// Mock classes required by OidcProviderModule.register
class MockOidcProviderConfigAppService {
  logoutSource = jest.fn();
  postLogoutSuccessSource = jest.fn();
  findAccount = jest.fn();
  finishInteraction = jest.fn();
  setProvider = jest.fn();
}

class MockServiceProviderAdapterService {
  getById = jest.fn();
  getList = jest.fn();
}

@Module({
  providers: [
    MockOidcProviderConfigAppService,
    MockServiceProviderAdapterService,
  ],
  exports: [
    MockOidcProviderConfigAppService,
    MockServiceProviderAdapterService,
  ],
})
class MockServiceProviderAdapterModule {}

describe('OidcProviderModule Dependency Validation', () => {
  it('should compile successfully with minimal config', async () => {
    const configServiceMock = getConfigMock();
    configServiceMock.get.mockReturnValue({ threshold: 'info' });

    const oidcProviderConfigAppMock = new MockOidcProviderConfigAppService();
    const jsonExceptionFilterMock = {
      catch: jest.fn(),
    };

    const moduleFixture = await Test.createTestingModule({
      imports: [
        OidcProviderModule.register(
          MockOidcProviderConfigAppService,
          MockServiceProviderAdapterService,
          MockServiceProviderAdapterModule,
        ),
        ConfigModule.forRoot(configServiceMock as any),
        LoggerModule.forRoot([]),
      ],
      providers: [
        {
          provide: OIDC_PROVIDER_CONFIG_APP_TOKEN,
          useValue: oidcProviderConfigAppMock,
        },
      ],
    })
      .overrideFilter(OidcProviderRenderedJsonExceptionFilter)
      .useValue(jsonExceptionFilterMock)
      .compile();

    expect(moduleFixture).toBeDefined();
    expect(moduleFixture.get(OidcProviderModule)).toBeDefined();
  });
});
