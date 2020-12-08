import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { CryptographyService } from '@fc/cryptography';
import { ConfigService } from '@fc/config';
import { SessionGenericService } from '../session-generic.service';
import { SessionInterceptor } from './session.interceptor';

describe('SessionInterceptor', () => {
  let interceptor: SessionInterceptor;

  const configServiceMock = {
    get: jest.fn(),
  };

  const configMock = {
    sessionCookieName: 'sessionCookieName',
    sessionIdLength: 64,
    excludedRoutes: ['/route/66', /excluded\/.*/],
    cookieOptions: {
      option: 'super-size',
    },
  };

  const sessionGenericServiceMock = {
    get: jest.fn(),
    set: jest.fn(),
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

  describe('onModuleInit', () => {
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

    it('should set the "sessionCookieName" attribute retrieved from the config', () => {
      // action
      interceptor.onModuleInit();

      // expect
      expect(interceptor['sessionCookieName']).toStrictEqual(
        configMock.sessionCookieName,
      );
    });

    it('should set the "sessionIdLength" attribute retrieved from the config', () => {
      // action
      interceptor.onModuleInit();

      // expect
      expect(interceptor['sessionIdLength']).toStrictEqual(
        configMock.sessionIdLength,
      );
    });
  });

  describe('intercept', () => {
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

  describe('handleSession', () => {
    const resMock = {
      send: jest.fn(),
    };

    const setCookieMock = jest.fn();

    beforeEach(() => {
      interceptor.onModuleInit();
      interceptor['setCookie'] = setCookieMock;
    });

    describe('no session cookie found in request signed cookies', () => {
      it('should generate a random string of sessionIdLength', async () => {
        // setup
        const reqMock = {
          signedCookies: {},
        };

        // action
        await interceptor['handleSession'](reqMock, resMock);

        // expect
        expect(cryptographyServiceMock.genRandomString).toHaveBeenCalledTimes(
          1,
        );
        expect(cryptographyServiceMock.genRandomString).toHaveBeenCalledWith(
          configMock.sessionIdLength,
        );
      });

      it('should store the random string in req.sessionId', async () => {
        // setup
        const reqMock = {
          signedCookies: {},
        } as any;
        const sessionIdMock = 'sessionId';
        cryptographyServiceMock.genRandomString.mockReturnValueOnce(
          sessionIdMock,
        );

        // action
        await interceptor['handleSession'](reqMock, resMock);

        // expect
        expect(reqMock.sessionId).toStrictEqual(sessionIdMock);
      });

      it('should set a cookie with res, the session cookie name and the session id', async () => {
        // setup
        const reqMock = {
          signedCookies: {},
        } as any;
        const sessionIdMock = 'sessionId';
        cryptographyServiceMock.genRandomString.mockReturnValueOnce(
          sessionIdMock,
        );

        // action
        await interceptor['handleSession'](reqMock, resMock);

        // expect
        expect(setCookieMock).toHaveBeenCalledTimes(1);
        expect(setCookieMock).toHaveBeenCalledWith(
          resMock,
          interceptor['sessionCookieName'],
          sessionIdMock,
        );
      });

      it('should put the session service in req.sessionService', async () => {
        // setup
        const reqMock = {
          signedCookies: {},
        } as any;

        // action
        await interceptor['handleSession'](reqMock, resMock);

        // expect
        expect(reqMock.sessionService).toStrictEqual(sessionGenericServiceMock);
      });
    });

    describe('session cookie found in request signed cookies', () => {
      it('should not generate a random string', async () => {
        // setup
        const reqMock = {
          signedCookies: {
            [configMock.sessionCookieName]: 'sessionId',
          },
        };

        // action
        await interceptor['handleSession'](reqMock, resMock);

        // expect
        expect(cryptographyServiceMock.genRandomString).toHaveBeenCalledTimes(
          0,
        );
      });

      it('should not set a cookie', async () => {
        // setup
        const reqMock = {
          signedCookies: {
            [configMock.sessionCookieName]: 'sessionId',
          },
        };
        const sessionIdMock = 'sessionId';
        cryptographyServiceMock.genRandomString.mockReturnValueOnce(
          sessionIdMock,
        );

        // action
        await interceptor['handleSession'](reqMock, resMock);

        // expect
        expect(setCookieMock).toHaveBeenCalledTimes(0);
      });

      it('should put the session service in req.sessionService', async () => {
        // setup
        const reqMock = {
          signedCookies: {
            [configMock.sessionCookieName]: 'sessionId',
          },
        } as any;

        // action
        await interceptor['handleSession'](reqMock, resMock);

        // expect
        expect(reqMock.sessionService).toStrictEqual(sessionGenericServiceMock);
      });
    });
  });

  describe('shouldHandleSession', () => {
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

  describe('setCookie', () => {
    const resMock = {
      cookie: jest.fn(),
    };
    const nameMock = 'cookie';
    const valueMock = 'monster';

    beforeEach(() => {
      interceptor.onModuleInit();
    });

    it('should get the cookies options from the config', () => {
      // action
      interceptor['setCookie'](resMock, nameMock, valueMock);

      // expect
      // First one is from "onModuleInit"
      expect(configServiceMock.get).toHaveBeenCalledTimes(2);
      expect(configServiceMock.get).toHaveBeenNthCalledWith(
        2,
        'SessionGeneric',
      );
    });

    it('should call "cookie" within the response with name, value and options from the config', () => {
      // action
      interceptor['setCookie'](resMock, nameMock, valueMock);

      // expect
      expect(resMock.cookie).toHaveBeenCalledTimes(1);
      expect(resMock.cookie).toHaveBeenCalledWith(
        nameMock,
        valueMock,
        configMock.cookieOptions,
      );
    });
  });
});
