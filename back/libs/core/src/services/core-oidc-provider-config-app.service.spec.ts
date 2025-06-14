import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@fc/config';
import { LoggerService } from '@fc/logger';
import { OidcClientService } from '@fc/oidc-client';
import { OidcCtx, OidcProviderErrorService } from '@fc/oidc-provider';
import { SessionService } from '@fc/session';
import { TrackingService } from '@fc/tracking';

import { getLoggerMock } from '@mocks/logger';
import { getSessionServiceMock } from '@mocks/session';

import { CoreMissingAtHashException } from '../exceptions';
import { CoreOidcProviderConfigAppService } from './core-oidc-provider-config-app.service';

describe('CoreOidcProviderConfigAppService', () => {
  let service: CoreOidcProviderConfigAppService;

  const sessionServiceMock = getSessionServiceMock();

  const errorServiceMock = {
    throwError: jest.fn(),
  };

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

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoreOidcProviderConfigAppService,
        LoggerService,
        SessionService,
        OidcProviderErrorService,
        OidcClientService,
        ConfigService,
        TrackingService,
      ],
    })
      .overrideProvider(SessionService)
      .useValue(sessionServiceMock)
      .overrideProvider(OidcProviderErrorService)
      .useValue(errorServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(OidcClientService)
      .useValue(oidcClientServiceMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(TrackingService)
      .useValue(trackingServiceMock)
      .compile();

    service = module.get<CoreOidcProviderConfigAppService>(
      CoreOidcProviderConfigAppService,
    );

    configServiceMock.get.mockReturnValue(appConfigMock);

    service['logoutFormSessionDestroy'] = jest.fn();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('logoutSource', () => {
    beforeEach(() => {
      service['getSessionId'] = jest.fn().mockResolvedValue(sessionId);
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
        CoreMissingAtHashException,
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
});
