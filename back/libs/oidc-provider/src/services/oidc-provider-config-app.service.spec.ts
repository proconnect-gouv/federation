import { KoaContextWithOIDC, Provider } from 'oidc-provider';

import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@fc/config';
import { throwException } from '@fc/exceptions/helpers';
import { LoggerService } from '@fc/logger';
import { OidcClientService } from '@fc/oidc-client';
import { SessionService } from '@fc/session';
import { TrackingService } from '@fc/tracking';

import { getLoggerMock } from '@mocks/logger';
import { getSessionServiceMock } from '@mocks/session';

import {
  OidcProviderMissingAtHashException,
  OidcProviderRuntimeException,
} from '../exceptions';
import { OidcCtx } from '../interfaces';
import { OidcProviderConfigAppService } from './oidc-provider-config-app.service';

jest.mock('@fc/exceptions/helpers', () => ({
  ...jest.requireActual('@fc/exceptions/helpers'),
  throwException: jest.fn(),
}));

describe('OidcProviderConfigAppService', () => {
  let service: OidcProviderConfigAppService;

  const throwExceptionMock = jest.mocked(throwException);

  const sessionServiceMock = getSessionServiceMock();

  const oidcClientServiceMock = {
    hasEndSessionUrl: jest.fn(),
  };

  const configServiceMock = {
    get: jest.fn(),
  };

  const atHashMock = 'at_hash Mock value';
  const sessionId = 'sessionIdMock value';

  const loggerServiceMock = getLoggerMock();

  const reqMock = { sessionId };
  const resMock = {};

  const ctxMock = {
    sessionId,
    req: reqMock,
    res: resMock,
    oidc: {
      entities: {
        IdTokenHint: {
          payload: {
            // OIDC defined var name
            // eslint-disable-next-line @typescript-eslint/naming-convention
            at_hash: atHashMock,
          },
        },
      },
    },
  } as unknown as OidcCtx;

  const idpIdMock = 'idp_id';
  const sessionOidcMock = {
    User: {
      idpId: idpIdMock,
      idpIdentity: {
        sub: 'idp_sub',
      },
    },
  };

  const trackingServiceMock = {
    TrackedEventsMap: { SP_REQUESTED_LOGOUT: {} },
    track: jest.fn(),
  };

  const appConfigMock = {
    urlPrefix: '/api/v2',
  };

  const form =
    '<form id="logoutId" method="post" action="https://redirect/me/there"><input type="hidden" name="xsrf" value="123456azerty"/></form>';

  const providerMock = {
    interactionFinished: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OidcProviderConfigAppService,
        SessionService,
        LoggerService,
        OidcClientService,
        ConfigService,
        TrackingService,
      ],
    })
      .overrideProvider(SessionService)
      .useValue(sessionServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(OidcClientService)
      .useValue(oidcClientServiceMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(TrackingService)
      .useValue(trackingServiceMock)
      .compile();

    service = module.get<OidcProviderConfigAppService>(
      OidcProviderConfigAppService,
    );

    configServiceMock.get.mockReturnValue(appConfigMock);

    service['provider'] = providerMock as unknown as Provider;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('postLogoutSuccessSource', () => {
    it('should set a body property to koa context', () => {
      // Given
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

      // When
      service.postLogoutSuccessSource(ctx);

      // Then
      expect(ctx).toHaveProperty('body', htmlPostLogoutSuccessSource);
    });
  });

  describe('logoutSource', () => {
    beforeEach(() => {
      service['getSessionId'] = jest.fn().mockResolvedValue(sessionId);

      service['logoutFormSessionDestroy'] = jest.fn();
    });

    it('should call hasEndSessionUrl if session & idpId is defined', async () => {
      // Given
      sessionServiceMock.getDataFromBackend.mockResolvedValue(sessionOidcMock);
      // When
      await service.logoutSource(ctxMock, form);
      // Then
      expect(oidcClientServiceMock.hasEndSessionUrl).toHaveBeenCalledTimes(1);
    });

    it('should call logoutFormSessionDestroy with given parameters if session & idpId is defined and hasEndSessionUrl return true', async () => {
      // Given
      sessionServiceMock.getDataFromBackend.mockResolvedValue(sessionOidcMock);
      oidcClientServiceMock.hasEndSessionUrl.mockResolvedValue(true);
      const expectedParamsMock = {
        method: 'POST',
        title: 'Déconnexion du FI',
        uri: '/api/v2/client/disconnect-from-idp',
      };
      // When
      await service.logoutSource(ctxMock, form);
      // Then
      expect(service['logoutFormSessionDestroy']).toHaveBeenCalledTimes(1);
      expect(service['logoutFormSessionDestroy']).toHaveBeenCalledWith(
        ctxMock,
        form,
        expectedParamsMock,
      );
    });

    it('should call logoutFormSessionDestroy with given parameters if hasEndSessionUrl is false', async () => {
      // Given
      sessionServiceMock.getDataFromBackend.mockResolvedValue(sessionOidcMock);
      oidcClientServiceMock.hasEndSessionUrl.mockResolvedValue(false);
      const expectedParamsMock = {
        method: 'GET',
        title: 'Déconnexion FC',
        uri: '/api/v2/client/logout-callback',
      };
      // When
      await service.logoutSource(ctxMock, form);
      // Then
      expect(service['logoutFormSessionDestroy']).toHaveBeenCalledTimes(1);
      expect(service['logoutFormSessionDestroy']).toHaveBeenCalledWith(
        ctxMock,
        form,
        expectedParamsMock,
      );
    });

    it('should render logout page when session is not defined', async () => {
      // Given
      sessionServiceMock.getDataFromBackend.mockImplementationOnce(() => {
        throw new Error('Session not found');
      });

      // When
      await service.logoutSource(ctxMock, form);
      // Then
      expect(ctxMock.body).toBeDefined();
    });
  });

  describe('getSessionId', () => {
    beforeEach(() => {
      sessionServiceMock.getAlias.mockResolvedValue(sessionId);
    });

    it('should return sessionId', async () => {
      // Given
      // When
      const result = await service['getSessionId'](ctxMock);
      // Then
      expect(result).toBe(sessionId);
    });

    it('should throw CoreFcaMissingAtHashException if at_hash is not a string', async () => {
      // Given
      ctxMock.oidc.entities.IdTokenHint.payload.at_hash = null;
      // When
      await expect(service['getSessionId'](ctxMock)).rejects.toThrow(
        OidcProviderMissingAtHashException,
      );
    });
  });

  describe('getLogoutParams', () => {
    it('should return params with idp logout url if hasIdpLogoutUrl is true', async () => {
      // Given
      const expectedParamsMock = {
        method: 'POST',
        title: 'Déconnexion du FI',
        uri: '/api/v2/client/disconnect-from-idp',
      };
      service['hasIdpLogoutUrl'] = jest.fn().mockResolvedValue(true);

      // When
      const result = await service['getLogoutParams'](idpIdMock);

      // Then
      expect(result).toEqual(expectedParamsMock);
    });

    it('should return params with client logout url if hasIdpLogoutUrl is false', async () => {
      // Given
      const expectedParamsMock = {
        method: 'GET',
        title: 'Déconnexion FC',
        uri: '/api/v2/client/logout-callback',
      };
      service['hasIdpLogoutUrl'] = jest.fn().mockResolvedValue(false);

      // When
      const result = await service['getLogoutParams'](idpIdMock);

      // Then
      expect(result).toEqual(expectedParamsMock);
    });
  });

  describe('hasIdpLogoutUrl', () => {
    it('should return false if idpId is not defined', async () => {
      // When
      const result = await service['hasIdpLogoutUrl'](undefined);
      // Then
      expect(result).toBe(false);
    });

    it('should call hasEndSessionUrl with idpId if idpId is defined', async () => {
      // Given
      // When
      await service['hasIdpLogoutUrl'](idpIdMock);
      // Then
      expect(oidcClientServiceMock.hasEndSessionUrl).toHaveBeenCalledTimes(1);
      expect(oidcClientServiceMock.hasEndSessionUrl).toHaveBeenCalledWith(
        sessionOidcMock.User.idpId,
      );
    });

    it('should return result from call to hasEndSessionUrl', async () => {
      // Given
      const hasEndSessionUrlResult = Symbol('hasEndSessionUrlResult');
      oidcClientServiceMock.hasEndSessionUrl.mockResolvedValue(
        hasEndSessionUrlResult,
      );
      // When
      const result = await service['hasIdpLogoutUrl'](idpIdMock);
      // Then
      expect(result).toBe(hasEndSessionUrlResult);
    });
  });

  describe('findAccount', () => {
    it('should return account details with accountId and claims when session is valid', async () => {
      // Given
      const sessionId = 'test-session-id';
      const spIdentityMock = { given_name: 'John', family_name: 'Doe' };
      sessionServiceMock.initCache.mockResolvedValueOnce(true);
      sessionServiceMock.get.mockReturnValueOnce({
        spIdentity: spIdentityMock,
      });

      // When
      const result = await service.findAccount(ctxMock, sessionId);

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
      await service.findAccount(ctxMock, sessionId);

      // Then
      expect(throwExceptionMock).toHaveBeenCalledWith(error);
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
    const params = {
      method: 'method',
      uri: '/uri',
      title: 'Title',
    };

    it('should save oidc logout confirmation form within oidc client session', async () => {
      // Given
      const logoutFormProperty = 'oidcProviderLogoutForm';
      // When
      await service.logoutFormSessionDestroy(ctxMock, form, params);
      // Then
      expect(sessionServiceMock.set).toHaveBeenCalledWith(
        'User',
        logoutFormProperty,
        form,
      );
    });

    it('should commit changes to session', async () => {
      // When
      await service.logoutFormSessionDestroy(ctxMock, form, params);
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
      await service.logoutFormSessionDestroy(ctxMock, form, params);
      // Then
      expect(ctxMock).toHaveProperty('body', htmlDisconnectFromFi);
    });
  });
});
