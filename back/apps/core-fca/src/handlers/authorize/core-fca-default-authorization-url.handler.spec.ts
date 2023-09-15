import { Test, TestingModule } from '@nestjs/testing';

import { LoggerService } from '@fc/logger-legacy';
import { OidcClientService } from '@fc/oidc-client';

import { CoreFcaDefaultAuthorizationHandler } from './core-fca-default-authorization-url.handler';

describe('CoreFcaDefaultAuthorizationHandler', () => {
  let service: CoreFcaDefaultAuthorizationHandler;

  const loggerServiceMock = {
    setContext: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    trace: jest.fn(),
  };

  const oidClientMock = {
    utils: {
      getAuthorizeUrl: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoreFcaDefaultAuthorizationHandler,
        LoggerService,
        OidcClientService,
      ],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(OidcClientService)
      .useValue(oidClientMock)
      .compile();

    service = module.get<CoreFcaDefaultAuthorizationHandler>(
      CoreFcaDefaultAuthorizationHandler,
    );

    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should call handle() returning an authorization url with sp_id', async () => {
    const params = {
      oidcClient: oidClientMock as unknown as OidcClientService,
      state: 'state',
      scope: 'scope',
      idpId: 'idpIdExample',
      // acr_values is an oidc defined variable name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: 'acr',
      nonce: 'nonce',
      spId: 'spId',
    };

    const expectedParams = {
      state: 'state',
      scope: 'scope',
      idpId: 'idpIdExample',
      // acr_values is an oidc defined variable name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: 'acr',
      nonce: 'nonce',
      claims: '{"id_token":{"amr":{"essential":true}}}',
    };

    const expectedAuthorizeUrl = 'prefix/authorize';
    oidClientMock.utils.getAuthorizeUrl.mockReturnValueOnce(
      expectedAuthorizeUrl,
    );
    const result = await service.handle(params);

    expect(oidClientMock.utils.getAuthorizeUrl).toBeCalledTimes(1);
    expect(oidClientMock.utils.getAuthorizeUrl).toBeCalledWith(expectedParams);
    expect(result).toBe('prefix/authorize&sp_id=spId');
  });
});
