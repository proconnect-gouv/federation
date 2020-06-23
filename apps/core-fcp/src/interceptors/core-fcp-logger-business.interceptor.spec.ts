import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { CoreFcpLoggerService } from '../services';
import { CoreFcpLoggerBusinessInterceptor } from './core-fcp-logger-business.interceptor';
import { IEventMap } from '../interfaces';

describe('CoreFcpLoggerBusinessInterceptor', () => {
  let interceptor: CoreFcpLoggerBusinessInterceptor;

  const coreFcpLoggerMock = {
    logEvent: jest.fn(),
  };

  const httpContextMock = {
    getRequest: jest.fn(),
  };

  const contextMock = ({
    switchToHttp: () => httpContextMock,
  } as unknown) as ExecutionContext;

  const reqMock = {
    ip: '123.123.123.123',
    fc: { interactionId: '42' },
  };

  const eventsMock = ({
    foo: { route: '/foo', intercept: true },
    bar: { route: '/bar', intercept: true },
    wizz: { route: '/wizz', intercept: false },
  } as unknown) as IEventMap;

  const nextMock = {
    handle: jest.fn(),
    pipe: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoreFcpLoggerBusinessInterceptor, CoreFcpLoggerService],
    })
      .overrideProvider(CoreFcpLoggerService)
      .useValue(coreFcpLoggerMock)
      .compile();

    interceptor = module.get<CoreFcpLoggerBusinessInterceptor>(
      CoreFcpLoggerBusinessInterceptor,
    );

    jest.resetAllMocks();
    nextMock.handle.mockReturnThis();
    httpContextMock.getRequest.mockReturnValue(reqMock);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    it('should not call logEvent until next', async () => {
      // Given
      interceptor['logEvent'] = jest.fn();
      // When
      await interceptor.intercept(contextMock, nextMock);
      // Then
      expect(interceptor['logEvent']).toHaveBeenCalledTimes(0);
    });
  });

  describe('logEvent', () => {
    it('should call LoggerService.logEvent', () => {
      // Given
      const eventMock = {};
      interceptor['getEvent'] = jest.fn().mockReturnValue(eventMock);
      // When
      interceptor['logEvent'](reqMock);
      // Then
      expect(coreFcpLoggerMock.logEvent).toHaveBeenCalledTimes(1);
      expect(coreFcpLoggerMock.logEvent).toHaveBeenCalledWith(
        eventMock,
        reqMock.ip,
        reqMock.fc.interactionId,
      );
    });
    it('should not call LoggerService.logEvent if event not found', () => {
      // Given
      const eventMock = undefined;
      interceptor['getEvent'] = jest.fn().mockReturnValue(eventMock);
      // When
      interceptor['logEvent'](reqMock);
      // Then
      expect(coreFcpLoggerMock.logEvent).toHaveBeenCalledTimes(0);
    });
  });

  describe('getEvent', () => {
    it('should deduce event from route', () => {
      // Given
      const req = { route: { path: '/bar' } };
      // When
      const result = interceptor['getEvent'](req, eventsMock);
      // Then
      expect(result).toBe(eventsMock.bar);
    });
    it('should not return event with falsy intercept', () => {
      // Given
      const req = { route: { path: '/wizz' } };
      // When
      const result = interceptor['getEvent'](req, eventsMock);
      // Then
      expect(result).toBeUndefined();
    });
    it('should not return event when there is not route match', () => {
      // Given
      const req = { route: { path: '/nowhere' } };
      // When
      const result = interceptor['getEvent'](req, eventsMock);
      // Then
      expect(result).toBeUndefined();
    });
  });
});
