import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { CryptographyService } from '@fc/cryptography';
import { ConfigService } from '@fc/config';
import { SessionGenericService } from '../session-generic.service';
import { SessionInterceptor } from './session.interceptor';
import { ISessionGenericRequest } from '../interfaces';

describe('SessionInterceptor', () => {
  let interceptor: SessionInterceptor;

  const configServiceMock = {
    get: jest.fn(),
  };

  const configMock = {
    sessionCookieName: 'sessionCookieName',
    sessionIdLength: 64,
    excludedRoutes: ['/route/66', /excluded\/.*/],
  };

  const sessionGenericServiceMock = {
    get: jest.fn(),
    set: jest.fn(),
    init: jest.fn(),
    refresh: jest.fn(),
    getSessionIdFromCookie: jest.fn(),
  };

  const cryptographyServiceMock = {
    genRandomString: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionInterceptor,
        ConfigService,
        CryptographyService,
        SessionGenericService,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(SessionGenericService)
      .useValue(sessionGenericServiceMock)
      .overrideProvider(CryptographyService)
      .useValue(cryptographyServiceMock)
      .compile();

    interceptor = module.get<SessionInterceptor>(SessionInterceptor);

    configServiceMock.get.mockReturnValue(configMock);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('onModuleInit()', () => {
    it('should retrieves the configuration', () => {
      // action
      interceptor.onModuleInit();

      // expect
      expect(configServiceMock.get).toHaveBeenCalledTimes(1);
      expect(configServiceMock.get).toHaveBeenCalledWith('SessionGeneric');
    });

    it('should set the "excludedRoutes" attribute retrieved from the config', () => {
      // action
      interceptor.onModuleInit();

      // expect
      expect(interceptor['excludedRoutes']).toStrictEqual(
        configMock.excludedRoutes,
      );
    });
  });

  describe('intercept()', () => {
    const executionContextMock = {
      switchToHttp: jest.fn(),
      getRequest: jest.fn(),
      getResponse: jest.fn(),
    };
    const reqMock = {
      route: {
        path: '/this-is-my-path/my-path-is-amazing',
      },
    };
    const nextMock = {
      handle: jest.fn(),
    };
    const handleSessionMock = jest.fn();
    const shouldHandleSessionMock = jest.fn();

    beforeEach(() => {
      executionContextMock.switchToHttp.mockReturnValue(executionContextMock);
      executionContextMock.getRequest.mockReturnValueOnce(reqMock);
      interceptor['handleSession'] = handleSessionMock;
      interceptor['shouldHandleSession'] = shouldHandleSessionMock;
    });

    it('should retieve the request from the execution context', async () => {
      // setup
      shouldHandleSessionMock.mockReturnValueOnce(false);

      // action
      await interceptor.intercept(
        (executionContextMock as unknown) as ExecutionContext,
        nextMock,
      );

      // expect
      expect(executionContextMock.switchToHttp).toHaveBeenCalledTimes(1);
      expect(executionContextMock.switchToHttp).toHaveBeenCalledWith();
      expect(executionContextMock.getRequest).toHaveBeenCalledTimes(1);
      expect(executionContextMock.getRequest).toHaveBeenCalledWith();
    });

    it('should check if it should handle the session for this route', async () => {
      // setup
      shouldHandleSessionMock.mockReturnValueOnce(false);

      // action
      await interceptor.intercept(
        (executionContextMock as unknown) as ExecutionContext,
        nextMock,
      );

      // expect
      expect(shouldHandleSessionMock).toHaveBeenCalledTimes(1);
      expect(shouldHandleSessionMock).toHaveBeenCalledWith(reqMock.route.path);
    });

    it('should not get the response from the execution context if it should not handle the session', async () => {
      // setup
      shouldHandleSessionMock.mockReturnValueOnce(false);

      // action
      await interceptor.intercept(
        (executionContextMock as unknown) as ExecutionContext,
        nextMock,
      );

      // expect
      // Only once for the request object !
      expect(executionContextMock.switchToHttp).toHaveBeenCalledTimes(1);
      expect(executionContextMock.switchToHttp).toHaveBeenCalledWith();
      expect(executionContextMock.getResponse).toHaveBeenCalledTimes(0);
    });

    it('should get the response from the execution context if it should handle the session', async () => {
      // setup
      shouldHandleSessionMock.mockReturnValueOnce(true);

      // action
      await interceptor.intercept(
        (executionContextMock as unknown) as ExecutionContext,
        nextMock,
      );

      // expect
      // Only once for the request object !
      expect(executionContextMock.switchToHttp).toHaveBeenCalledTimes(2);
      expect(executionContextMock.switchToHttp).toHaveBeenCalledWith();
      expect(executionContextMock.getResponse).toHaveBeenCalledTimes(1);
    });

    it('should not call handleSession if it should not handle the session', async () => {
      // setup
      shouldHandleSessionMock.mockReturnValueOnce(false);

      // action
      await interceptor.intercept(
        (executionContextMock as unknown) as ExecutionContext,
        nextMock,
      );

      // expect
      expect(handleSessionMock).toHaveBeenCalledTimes(0);
    });

    it('should call handleSession with req and res if it should handle the session', async () => {
      // setup
      shouldHandleSessionMock.mockReturnValueOnce(true);
      const resMock = {
        send: jest.fn(),
      };
      executionContextMock.getResponse.mockReturnValueOnce(resMock);

      // action
      await interceptor.intercept(
        (executionContextMock as unknown) as ExecutionContext,
        nextMock,
      );

      // expect
      expect(handleSessionMock).toHaveBeenCalledTimes(1);
      expect(handleSessionMock).toHaveBeenCalledWith(reqMock, resMock);
    });

    it('should call the next handler if it should the handle session', async () => {
      // setup
      shouldHandleSessionMock.mockReturnValueOnce(true);

      // action
      await interceptor.intercept(
        (executionContextMock as unknown) as ExecutionContext,
        nextMock,
      );

      // expect
      expect(nextMock.handle).toHaveBeenCalledTimes(1);
      expect(nextMock.handle).toHaveBeenCalledWith();
    });

    it('should call the next handler if it should not handle the session', async () => {
      // setup
      shouldHandleSessionMock.mockReturnValueOnce(false);

      // action
      await interceptor.intercept(
        (executionContextMock as unknown) as ExecutionContext,
        nextMock,
      );

      // expect
      expect(nextMock.handle).toHaveBeenCalledTimes(1);
      expect(nextMock.handle).toHaveBeenCalledWith();
    });
  });

  describe('handleSession()', () => {
    const resMock = {
      send: jest.fn(),
    };

    const setCookieMock = jest.fn();

    beforeEach(() => {
      interceptor.onModuleInit();
      interceptor['setCookie'] = setCookieMock;
    });

    it('should call `sessionGenericService.init()` if no session cookie found in request signed cookies', async () => {
      // Given
      const reqMock: ISessionGenericRequest = ({
        signedCookies: {},
      } as unknown) as ISessionGenericRequest;

      const cookieSessionIdMock = undefined;
      sessionGenericServiceMock.getSessionIdFromCookie.mockReturnValue(
        cookieSessionIdMock,
      );
      // When
      await interceptor['handleSession'](reqMock, resMock);
      // Then
      expect(sessionGenericServiceMock.refresh).toHaveBeenCalledTimes(0);
      expect(sessionGenericServiceMock.init).toHaveBeenCalledTimes(1);
      expect(sessionGenericServiceMock.init).toHaveBeenCalledWith(
        reqMock,
        resMock,
      );
    });

    it('should call `sessionGenericService.refresh()` if cookie found in request signed cookies', async () => {
      // Given
      const reqCookieMock: ISessionGenericRequest = ({
        signedCookies: {
          [configMock.sessionCookieName]: 'sessionIdValue',
        },
      } as unknown) as ISessionGenericRequest;

      const cookieSessionIdMock = 'cookieSessionIdValue';
      sessionGenericServiceMock.getSessionIdFromCookie.mockReturnValue(
        cookieSessionIdMock,
      );
      // When
      await interceptor['handleSession'](reqCookieMock, resMock);
      // Then
      expect(sessionGenericServiceMock.init).toHaveBeenCalledTimes(0);
      expect(sessionGenericServiceMock.refresh).toHaveBeenCalledTimes(1);
      expect(sessionGenericServiceMock.refresh).toHaveBeenCalledWith(
        reqCookieMock,
        resMock,
      );
    });
  });

  describe('shouldHandleSession()', () => {
    beforeEach(() => {
      interceptor.onModuleInit();
    });

    it('should return true for a route that does not match any exluded route', () => {
      // setup
      const route = '/cause/I/was/on/the/road/all/the/livelong/day';

      // action
      const result = interceptor['shouldHandleSession'](route);

      // expect
      expect(result).toStrictEqual(true);
    });

    it('should return false for a route that match a RegExp in the excluded routes', () => {
      // setup
      const route = '/route/excluded/69';

      // action
      const result = interceptor['shouldHandleSession'](route);

      // expect
      expect(result).toStrictEqual(false);
    });

    it('should return false for a route that match exactly a string in the excluded routes', () => {
      // setup
      const route = '/route/66';

      // action
      const result = interceptor['shouldHandleSession'](route);

      // expect
      expect(result).toStrictEqual(false);
    });
  });
});
