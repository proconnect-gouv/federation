import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { ConfigService } from '@fc/config';
import { SessionService } from './session.service';
import { SessionInterceptor } from './session.interceptor';
import {
  SessionNoSessionCookieException,
  SessionNoInteractionCookieException,
} from './exceptions';

describe('SessionInterceptor', () => {
  let interceptor: SessionInterceptor;

  const sessionConfigMock = {
    sessionCookieName: 'session_cookie',
    interactionCookieName: 'interaction_cookie',
  };

  const appConfigMock = {
    urlPrefix: '/api/v2',
  };

  const configMock = {
    get: (config: string) => {
      switch (config) {
        case 'App':
          return appConfigMock;
        case 'Session':
          return sessionConfigMock;
      }
    },
  };

  const sessionMock = {
    setCookie: jest.fn(),
    verify: jest.fn(),
    refresh: jest.fn(),
  };

  const httpContextMock = {
    getResponse: jest.fn(),
    getRequest: jest.fn(),
  };

  const contextMock = ({
    switchToHttp: () => httpContextMock,
  } as unknown) as ExecutionContext;

  const reqMock = {};
  const resMock = {};

  const nextMock = {
    handle: jest.fn(),
  } as CallHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SessionInterceptor, ConfigService, SessionService],
    })
      .overrideProvider(ConfigService)
      .useValue(configMock)
      .overrideProvider(SessionService)
      .useValue(sessionMock)
      .compile();

    interceptor = module.get<SessionInterceptor>(SessionInterceptor);

    jest.resetAllMocks();

    httpContextMock.getRequest.mockReturnValue(reqMock);
    httpContextMock.getResponse.mockReturnValue(resMock);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    it('should call handleCookie before next.handle()', async () => {
      // Given
      interceptor['handleSession'] = jest.fn();
      // When
      await interceptor.intercept(contextMock, nextMock);
      // Then
      expect(interceptor['handleSession']).toHaveBeenCalledTimes(1);
      expect(interceptor['handleSession']).toHaveBeenCalledWith(
        reqMock,
        resMock,
      );
      expect(nextMock.handle).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleSession', () => {
    it('should throw if on front route and no session cookie found', () => {
      // Given
      const req = {
        route: {
          path: '/api/v2/interaction/:uid',
        },
        signedCookies: {},
      };

      // Then
      expect(interceptor['handleSession'](req, resMock)).rejects.toThrow(
        SessionNoSessionCookieException,
      );
    });

    it('should throw if on front route and session cookie found but no interaction cookie found', () => {
      // Given
      const req = {
        route: {
          path: '/api/v2/interaction/:uid',
        },
        signedCookies: {
          [sessionConfigMock.sessionCookieName]: 'foo',
        },
      };

      // Then
      expect(interceptor['handleSession'](req, resMock)).rejects.toThrow(
        SessionNoInteractionCookieException,
      );
    });

    it('should throw if on front route and interaction cookie found but no session cookie found', () => {
      // Given
      const req = {
        route: {
          path: '/api/v2/interaction/:uid',
        },
        signedCookies: {
          [sessionConfigMock.interactionCookieName]: 'bar',
        },
      };

      // Then
      expect(interceptor['handleSession'](req, resMock)).rejects.toThrow(
        SessionNoSessionCookieException,
      );
    });

    it('should set req.fc.interactionId', async () => {
      // Given
      const req = {
        fc: { interactionId: undefined },
        route: {
          path: '/api/v2/interaction/:uid',
        },
        signedCookies: {
          [sessionConfigMock.sessionCookieName]: 'foo',
          [sessionConfigMock.interactionCookieName]: 'bar',
        },
      };
      sessionMock.refresh.mockResolvedValueOnce(undefined);

      // When
      await interceptor['handleSession'](req, resMock);

      // Then
      expect(req.fc.interactionId).toBeDefined();
      expect(req.fc.interactionId).toBe('bar');
    });

    it('should refresh backend session', async () => {
      // Given
      const req = {
        route: {
          path: '/api/v2/interaction/:uid',
        },
        signedCookies: {
          [sessionConfigMock.sessionCookieName]: 'foo',
          [sessionConfigMock.interactionCookieName]: 'bar',
        },
      };
      sessionMock.refresh.mockResolvedValueOnce(undefined);

      // When
      await interceptor['handleSession'](req, resMock);

      // Then
      expect(sessionMock.refresh).toHaveBeenCalledTimes(1);
    });

    it("should throw if the session can't be refreshed", async () => {
      // Given
      const req = {
        route: {
          path: '/api/v2/interaction/:uid',
        },
        signedCookies: {
          [sessionConfigMock.sessionCookieName]: 'foo',
          [sessionConfigMock.interactionCookieName]: 'bar',
        },
      };
      sessionMock.refresh.mockRejectedValueOnce(new Error('test'));

      // Then
      await expect(
        interceptor['handleSession'](req, resMock),
      ).rejects.toThrow();
    });

    it('should call `sessionOidc.setCookie()` for both cookies if found', async () => {
      // Given
      const req = {
        route: {
          path: '/api/v2/interaction/:uid',
        },
        signedCookies: {
          [sessionConfigMock.sessionCookieName]: 'foo',
          [sessionConfigMock.interactionCookieName]: 'bar',
        },
      };
      sessionMock.refresh.mockResolvedValueOnce(undefined);

      // When
      await interceptor['handleSession'](req, resMock);

      // Then
      expect(sessionMock.setCookie).toHaveBeenCalledTimes(2);
      expect(sessionMock.setCookie).toHaveBeenCalledWith(
        resMock,
        sessionConfigMock.sessionCookieName,
        'foo',
      );
      expect(sessionMock.setCookie).toHaveBeenCalledWith(
        resMock,
        sessionConfigMock.interactionCookieName,
        'bar',
      );
    });

    it('should not throw if route is not listed', () => {
      // Given
      const req = {
        route: {
          path: '/somewhere',
        },
      };
      sessionMock.refresh.mockResolvedValueOnce(undefined);

      // Then
      expect(interceptor['handleSession'](req, resMock)).resolves.not.toThrow();
    });

    it('should not have any side effect if route is not listed', async () => {
      // Given
      const req = {
        fc: { interactionId: undefined },
        route: {
          path: '/somewhere',
        },
      };
      sessionMock.refresh.mockResolvedValueOnce(undefined);

      // When
      await interceptor['handleSession'](req, resMock);

      // Then
      expect(sessionMock.refresh).toHaveBeenCalledTimes(0);

      expect(sessionMock.setCookie).toHaveBeenCalledTimes(0);

      expect(req.fc.interactionId).not.toBeDefined();
      expect(sessionMock.setCookie).toHaveBeenCalledTimes(0);
    });
  });
});
