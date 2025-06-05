import { KoaContextWithOIDC, Provider } from 'oidc-provider';

import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@fc/config';
import { throwException } from '@fc/exceptions/helpers';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';

import { getConfigMock } from '@mocks/config';
import { getLoggerMock } from '@mocks/logger';
import { getSessionServiceMock } from '@mocks/session';

import { OidcProviderRuntimeException } from '../exceptions';
import { LogoutFormParamsInterface } from '../interfaces';
import { OidcProviderAppConfigLibService } from './oidc-provider-app-config-lib.service';
import { OidcProviderErrorService } from './oidc-provider-error.service';

jest.mock('@fc/exceptions/helpers', () => ({
  ...jest.requireActual('@fc/exceptions/helpers'),
  throwException: jest.fn(),
}));

describe('OidcProviderAppConfigLibService', () => {
  let service: OidcProviderAppConfigLibService;

  const throwExceptionMock = jest.mocked(throwException);

  class AppTest extends OidcProviderAppConfigLibService {}

  const sessionServiceMock = getSessionServiceMock();

  const loggerMock = getLoggerMock();
  const configMock = getConfigMock();

  const errorServiceMock = {
    throwError: jest.fn(),
  };

  const providerMock = {
    interactionFinished: jest.fn(),
  };

  const ctx = {
    request: {
      method: 'POST',
      url: 'https://url.com',
    },
    response: {
      status: 200,
      message: 'OK',
    },
    req: 'toto',
  } as unknown as KoaContextWithOIDC;
  const form =
    '<form id="logoutId" method="post" action="https://redirect/me/there"><input type="hidden" name="xsrf" value="123456azerty"/></form>';

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppTest,
        LoggerService,
        SessionService,
        OidcProviderErrorService,
        ConfigService,
      ],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .overrideProvider(SessionService)
      .useValue(sessionServiceMock)
      .overrideProvider(OidcProviderErrorService)
      .useValue(errorServiceMock)
      .overrideProvider(ConfigService)
      .useValue(configMock)
      .compile();

    service = module.get<AppTest>(AppTest);

    service['provider'] = providerMock as any;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('logoutSource', () => {
    it('should set a body property to koa context', () => {
      // Given
      const htmlDisconnectFromFi = `<!DOCTYPE html>
      <head>
        <title>Déconnexion</title>
      </head>
      <body>
        ${form}
        <script>
          var form = document.forms[0];
          var input = document.createElement('input');
          input.type = 'hidden';
          input.name = 'logout';
          input.value = 'yes';
          form.appendChild(input);
          form.submit();
        </script>
      </body>
    </html>`;
      // When
      service.logoutSource(ctx, form);
      // Then
      expect(ctx).toHaveProperty('body', htmlDisconnectFromFi);
    });
  });

  describe('postLogoutSuccessSource', () => {
    it('should set a body property to koa context', () => {
      // GIVEN
      const ctx = {
        request: {
          method: 'POST',
          url: 'https://url.com',
        },
        response: {
          status: 200,
          message: 'OK',
        },
        req: 'toto',
      } as unknown as KoaContextWithOIDC;

      const htmlPostLogoutSuccessSource = `<!DOCTYPE html>
        <head>
          <title>Déconnexion</title>
        </head>
        <body>
          <p>Vous êtes bien déconnecté, vous pouvez fermer votre navigateur.</p>
        </body>
        </html>`;

      // WHEN
      service.postLogoutSuccessSource(ctx);

      // THEN
      expect(ctx).toHaveProperty('body', htmlPostLogoutSuccessSource);
    });
  });

  describe('findAccount()', () => {
    it('should return account details with accountId and claims when session is valid', async () => {
      // Given
      const sessionId = 'test-session-id';
      const spIdentityMock = { given_name: 'John', family_name: 'Doe' };
      sessionServiceMock.initCache.mockResolvedValueOnce(true);
      sessionServiceMock.get.mockReturnValueOnce({
        spIdentity: spIdentityMock,
      });

      // When
      const result = await service.findAccount(ctx, sessionId);

      // Then
      expect(result).toEqual({
        accountId: sessionId,
        claims: expect.any(Function),
      });

      // Claims function test
      const claims = await result.claims();
      expect(claims).toEqual(spIdentityMock);
    });

    it('should throw an error when session initialization fails', async () => {
      // Given
      const sessionId = 'invalid-session-id';
      const error = new Error('Session initialization failed');
      sessionServiceMock.initCache.mockRejectedValueOnce(error);

      // When
      await service.findAccount(ctx, sessionId);

      // Then
      expect(throwExceptionMock).toHaveBeenCalledWith(error);
    });
  });

  describe('getServiceProviderIdFromCtx()', () => {
    it('should return the sp client id', () => {
      // Given
      const contextMock = {
        oidc: { entities: { Client: { clientId: 'clientId' } } },
      } as unknown as KoaContextWithOIDC;
      // When
      const result = service['getServiceProviderIdFromCtx'](contextMock);
      // Then
      expect(result).toBe('clientId');
    });
  });

  describe('finishInteraction', () => {
    // Given
    const reqMock = {
      fc: { interactionId: 'interactiondMockValue' },
    };
    const resMock = {};

    beforeEach(() => {
      sessionServiceMock.getId.mockReturnValue('sessionId');
    });

    it('should finish interaction with grant', async () => {
      // Given
      const resultMock = {
        consent: {},
        login: {
          accountId: 'sessionId',
          acr: 'acrValue',
          amr: ['amrValue'],
          ts: expect.any(Number),
          remember: false,
        },
      };
      providerMock.interactionFinished.mockResolvedValueOnce('ignoredValue');
      // When
      await service.finishInteraction(reqMock, resMock, {
        amr: ['amrValue'],
        acr: 'acrValue',
      });

      // Then
      expect(providerMock.interactionFinished).toHaveBeenCalledTimes(1);
      expect(providerMock.interactionFinished).toHaveBeenCalledWith(
        reqMock,
        resMock,
        resultMock,
      );
    });

    it('should throw OidcProviderRuntimeException', async () => {
      // Given
      providerMock.interactionFinished.mockRejectedValueOnce(
        new Error('invalid_request'),
      );

      // Then
      await expect(
        service.finishInteraction(reqMock, resMock, {
          amr: ['amrValue'],
          acr: 'acrValue',
        }),
      ).rejects.toThrow(OidcProviderRuntimeException);
    });
  });

  describe('setProvider()', () => {
    it('should set provider value', () => {
      // Given
      const providerMock = 'providerMock' as unknown as Provider;
      // When
      service.setProvider(providerMock);
      // Then
      expect(service['provider']).toEqual('providerMock');
    });
  });

  describe('logoutFormSessionDestroy', () => {
    const params: LogoutFormParamsInterface = {
      method: 'method',
      uri: '/uri',
      title: 'Title',
    };

    it('should save oidc logout confirmation form within oidc client session', async () => {
      // Given
      const logoutFormProperty = 'oidcProviderLogoutForm';
      // When
      await service.logoutFormSessionDestroy(ctx, form, params);
      // Then
      expect(sessionServiceMock.set).toHaveBeenCalledTimes(1);
      expect(sessionServiceMock.set).toHaveBeenCalledWith(
        'User',
        logoutFormProperty,
        form,
      );
      expect(sessionServiceMock.commit).toHaveBeenCalledTimes(1);
    });

    it('should commit changes to session', async () => {
      // When
      await service.logoutFormSessionDestroy(ctx, form, params);
      // Then
      expect(sessionServiceMock.commit).toHaveBeenCalledTimes(1);
    });

    it('should set a body property to koa context', async () => {
      // Given
      const htmlDisconnectFromFi = `<!DOCTYPE html>
      <head>
        <title>Title</title>
      </head>
      <body>
        <form method="method" action="/uri">
        </form>
        <script>
          var form = document.forms[0];
          form.submit();
        </script>
      </body>
    </html>`;
      // When
      await service.logoutFormSessionDestroy(ctx, form, params);
      // Then
      expect(ctx).toHaveProperty('body', htmlDisconnectFromFi);
    });
  });
});
