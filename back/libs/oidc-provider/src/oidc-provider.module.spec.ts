// import { Module } from '@nestjs/common';
// import { Test } from '@nestjs/testing';

// import { ConfigModule } from '@fc/config';
// import { LoggerModule } from '@fc/logger';

// import { getConfigMock } from '@mocks/config';

// import { OidcProviderRenderedJsonExceptionFilter } from './filters';
// import { OidcProviderModule } from './oidc-provider.module';

// // Mock classes required by OidcProviderModule.register
// class MockServiceProviderAdapterService {
//   getById = jest.fn();
//   getList = jest.fn();
// }

// class MockIdentityProviderAdapterService {
//   getById = jest.fn();
//   getList = jest.fn();
//   isActiveById = jest.fn();
//   refreshCache = jest.fn();
// }

// @Module({
//   providers: [MockServiceProviderAdapterService],
//   exports: [MockServiceProviderAdapterService],
// })
// class MockServiceProviderAdapterModule {}

// @Module({
//   providers: [MockIdentityProviderAdapterService],
//   exports: [MockIdentityProviderAdapterService],
// })
// class MockIdentityProviderAdapterModule {}

// describe('OidcProviderModule Dependency Validation', () => {
//   it('should compile successfully with minimal config', async () => {
//     const configServiceMock = getConfigMock();
//     configServiceMock.get.mockReturnValue({ threshold: 'info' });

//     const jsonExceptionFilterMock = {
//       catch: jest.fn(),
//     };

//     const moduleFixture = await Test.createTestingModule({
//       imports: [
//         OidcProviderModule.register(
//           MockIdentityProviderAdapterService,
//           MockIdentityProviderAdapterModule,
//           MockServiceProviderAdapterService,
//           MockServiceProviderAdapterModule,
//         ),
//         ConfigModule.forRoot(configServiceMock as any),
//         LoggerModule.forRoot([]),
//       ],
//       providers: [],
//     })
//       .overrideFilter(OidcProviderRenderedJsonExceptionFilter)
//       .useValue(jsonExceptionFilterMock)
//       .compile();

//     expect(moduleFixture).toBeDefined();
//     expect(moduleFixture.get(OidcProviderModule)).toBeDefined();
//   });
// });

import { Test, TestingModule } from '@nestjs/testing';

import { ConfigModule } from '@fc/config';
import { LoggerModule, LoggerService } from '@fc/logger';
import { SERVICE_PROVIDER_SERVICE_TOKEN } from '@fc/oidc/tokens';
import { IDENTITY_PROVIDER_SERVICE } from '@fc/oidc-client/tokens';
import { TrackingModule } from '@fc/tracking';

import { getConfigMock } from '@mocks/config';

import { OidcProviderModule } from './oidc-provider.module';
import { OidcProviderService } from './oidc-provider.service';

describe('OidcProviderModule', () => {
  let module: TestingModule;

  class MockIdentityProviderAdapterModule {}
  class MockServiceProviderModule {}
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

  const configServiceMock = getConfigMock();

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        OidcProviderModule.register(
          MockIdentityProviderAdapterService,
          MockIdentityProviderAdapterModule,
          MockServiceProviderAdapterService,
          MockServiceProviderModule,
        ),
        ConfigModule.forRoot(configServiceMock as any),
        LoggerModule.forRoot([]),
        TrackingModule,
      ],
      providers: [LoggerService],
    }).compile();
  });

  it('should inject OidcProviderService', () => {
    const service = module.get<OidcProviderService>(OidcProviderService);
    expect(service).toBeDefined();
  });

  it('should inject SERVICE_PROVIDER_SERVICE_TOKEN', () => {
    const serviceProvider = module.get(SERVICE_PROVIDER_SERVICE_TOKEN);
    expect(serviceProvider).toBeDefined();
  });

  it('should inject IDENTITY_PROVIDER_SERVICE', () => {
    const identityProvider = module.get(IDENTITY_PROVIDER_SERVICE);
    expect(identityProvider).toBeDefined();
  });
});
