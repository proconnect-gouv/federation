import { Test, TestingModule } from '@nestjs/testing';

import { LoggerService } from '@fc/logger-legacy';
import { OidcClientService } from '@fc/oidc-client';

import { CoreFcaMcpAuthorizationHandler } from './core-fca-mcp-authorization-url.handler';

describe('CoreFcaMcpAuthorizationHandler', () => {
  let service: CoreFcaMcpAuthorizationHandler;

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
        CoreFcaMcpAuthorizationHandler,
        LoggerService,
        OidcClientService,
      ],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(OidcClientService)
      .useValue(oidClientMock)
      .compile();

    service = module.get<CoreFcaMcpAuthorizationHandler>(
      CoreFcaMcpAuthorizationHandler,
    );

    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should call handle() returning an authorization url with sp_id and adding is_service_public in scope', async () => {
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
      scope: 'scope is_service_public',
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

  it('should call handle() returning an authorization url with sp_id and not adding again is_service_public in scope', async () => {
    const params = {
      oidcClient: oidClientMock as unknown as OidcClientService,
      state: 'state',
      scope: 'is_service_public',
      idpId: 'idpIdExample',
      // acr_values is an oidc defined variable name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: 'acr',
      nonce: 'nonce',
      spId: 'spId',
    };

    const expectedParams = {
      state: 'state',
      scope: 'is_service_public',
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
