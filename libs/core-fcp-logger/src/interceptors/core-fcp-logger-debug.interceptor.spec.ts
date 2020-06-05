import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { LoggerService } from '@fc/logger';
import { CoreFcpLoggerDebugInterceptor } from './core-fcp-logger-debug.interceptor';

describe('CoreFcpLoggerDebugInterceptor', () => {
  let interceptor: CoreFcpLoggerDebugInterceptor;

  const httpContextMock = {
    getResponse: jest.fn(),
    getRequest: jest.fn(),
  };

  const contextMock = ({
    switchToHttp: () => httpContextMock,
  } as unknown) as ExecutionContext;

  const reqMock = {
    method: 'GET',
    url: '/somewhere/42',
    route: { path: '/somewhere/:param' },
  };

  const nextMock = {
    handle: jest.fn(),
    pipe: jest.fn(),
  };

  const loggerMock = ({
    setContext: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  } as unknown) as LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoreFcpLoggerDebugInterceptor, LoggerService],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .compile();

    interceptor = module.get<CoreFcpLoggerDebugInterceptor>(
      CoreFcpLoggerDebugInterceptor,
    );

    jest.resetAllMocks();
    nextMock.handle.mockReturnThis();
    httpContextMock.getRequest.mockReturnValue(reqMock);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('constructor', () => {
    it('should call loggerService.setContext', () => {
      // When
      new CoreFcpLoggerDebugInterceptor(loggerMock);
      // Then
      expect(loggerMock.setContext).toHaveBeenCalledTimes(1);
      expect(loggerMock.setContext).toHaveBeenCalledWith(
        'CoreFcpLoggerDebugInterceptor',
      );
    });
  });

  describe('intercept', () => {
    it('should call LoggerService.debug', () => {
      // When
      interceptor.intercept(contextMock, nextMock);
      // Then
      expect(loggerMock.debug).toHaveBeenCalledTimes(1);
      expect(loggerMock.debug).toHaveBeenCalledWith(
        `${reqMock.method} ${reqMock.route.path}`,
      );
    });

    it('should call LoggerService.verbose', () => {
      // When
      interceptor.intercept(contextMock, nextMock);
      // Then
      expect(loggerMock.verbose).toHaveBeenCalledTimes(1);
      expect(loggerMock.verbose).toHaveBeenCalledWith(reqMock.url);
    });

    it('should call next.handle', () => {
      // When
      interceptor.intercept(contextMock, nextMock);
      // Then
      expect(nextMock.handle).toHaveBeenCalledTimes(1);
    });
  });
});
