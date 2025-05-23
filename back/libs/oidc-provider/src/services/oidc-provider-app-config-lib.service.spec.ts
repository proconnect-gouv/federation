import { KoaContextWithOIDC, Provider } from 'oidc-provider';

import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@fc/config';
import { throwException } from '@fc/exceptions/helpers';
import { LoggerService } from '@fc/logger';
import { SessionService, SessionSubNotFoundException } from '@fc/session';

import { getConfigMock } from '@mocks/config';
import { getLoggerMock } from '@mocks/logger';
import { getSessionServiceMock } from '@mocks/session';

import {
  OidcProviderRuntimeException,
  OidcProviderSpIdNotFoundException,
} from '../exceptions';
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
    // Given
    const contextMock = {
      not: 'altered',
    } as unknown as KoaContextWithOIDC;
    const interactionIdMock = '123ABC';
    const identityMock = { foo: 'bar' };

    beforeEach(() => {
      service['getServiceProviderIdFromCtx'] = jest
        .fn()
        .mockReturnValue('clientId');

      sessionServiceMock.initCache.mockResolvedValue(true);
    });

    it('should return an object with accountID', async () => {
      // Given
      sessionServiceMock.get.mockReturnValueOnce({
        spIdentity: identityMock,
        subs: { clientId: 'sub client id' },
      });
      // When
      const result = await service['findAccount'](
        contextMock,
        interactionIdMock,
      );
      // Then
      expect(result).toHaveProperty('accountId');
      expect(result.accountId).toBe(interactionIdMock);
    });

    it('should not alter the context', async () => {
      // When
      await service['findAccount'](contextMock, interactionIdMock);
      // Then
      expect(contextMock).toEqual({
        not: 'altered',
      });
    });

    it('should return an object with a claims function that returns identity', async () => {
      // Given
      sessionServiceMock.get.mockReturnValueOnce({
        spIdentity: identityMock,
        subs: { clientId: 'sub client id' },
      });
      const result = await service['findAccount'](
        contextMock,
        interactionIdMock,
      );
      // When
      const claimsResult = await result.claims();
      // Then
      expect(claimsResult).toStrictEqual({ foo: 'bar', sub: 'sub client id' });
      expect(contextMock).toEqual({
        not: 'altered',
      });
    });

    it('should return an object with a claims function that returns identity (even with several subs)', async () => {
      // Given
      sessionServiceMock.get.mockReturnValueOnce({
        spIdentity: identityMock,
        subs: {
          clientId: 'sub client id',
          OtherClientId: 'sub other client id',
        },
      });
      const result = await service['findAccount'](
        contextMock,
        interactionIdMock,
      );
      // When
      const claimsResult = await result.claims();
      // Then
      expect(claimsResult).toStrictEqual({ foo: 'bar', sub: 'sub client id' });
      expect(contextMock).toEqual({
        not: 'altered',
      });
    });

    it('should call throwError if an exception is caught', async () => {
      // Given
      const errorMock = new Error('error');
      sessionServiceMock.initCache.mockRejectedValueOnce(errorMock);
      service['throwError'] = jest.fn();
      // When
      await service['findAccount'](contextMock, interactionIdMock);
      // Then
      expect(throwExceptionMock).toHaveBeenCalledWith(errorMock);
      expect(contextMock).toEqual({
        not: 'altered',
      });
    });

    it('should call checkSpId with ctx and spId found', async () => {
      // Given
      sessionServiceMock.get.mockReturnValueOnce({
        spIdentity: identityMock,
        subs: { clientId: 'sub client id' },
      });
      service['checkSpId'] = jest.fn();
      // When
      await service['findAccount'](contextMock, interactionIdMock);
      // Then
      expect(service['checkSpId']).toHaveBeenCalledTimes(1);
      expect(service['checkSpId']).toHaveBeenCalledWith('clientId');
    });

    it('should call checkSub with ctx and sub found', async () => {
      // Given
      sessionServiceMock.get.mockReturnValueOnce({
        spIdentity: identityMock,
        subs: { clientId: 'sub client id' },
      });
      service['checkSub'] = jest.fn();
      // When
      await service['findAccount'](contextMock, interactionIdMock);
      // Then
      expect(service['checkSub']).toHaveBeenCalledTimes(1);
      expect(service['checkSub']).toHaveBeenCalledWith('sub client id');
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

  describe('checkSpId()', () => {
    it('should throw OidcProviderSpIdNotFoundException if sp id not defined on panva context', async () => {
      // Given
      const spIdMock = undefined;

      // When
      await service['checkSpId'](spIdMock);

      // Then
      expect(throwExceptionMock).toHaveBeenCalledWith(
        expect.any(OidcProviderSpIdNotFoundException),
      );
    });
  });

  describe('checkSub()', () => {
    it('should throw SessionSubNotFoundException if sub not found in session', async () => {
      // Given
      const subMock = undefined;

      // When
      await service['checkSub'](subMock);

      // Then
      expect(throwExceptionMock).toHaveBeenCalledWith(
        expect.any(SessionSubNotFoundException),
      );
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
