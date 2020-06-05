import { ArgumentsHost } from '@nestjs/common';
import { LoggerService } from '@fc/logger';
import { FcExceptionFilter } from './fc.exception-filter';
import { FcException } from '../exceptions';

describe('FcExceptionFilter', () => {
  let exceptionFilter: FcExceptionFilter;
  const loggerMock = ({
    debug: jest.fn(),
    warn: jest.fn(),
    setContext: jest.fn(),
  } as unknown) as LoggerService;

  const resMock: any = {};
  resMock.render = jest.fn().mockReturnValue(resMock);
  resMock.status = jest.fn().mockReturnValue(resMock);

  const argumentHostMock = {
    switchToHttp: () => ({
      getResponse: () => resMock,
    }),
  } as ArgumentsHost;

  beforeEach(() => {
    exceptionFilter = new FcExceptionFilter(loggerMock);
    jest.resetAllMocks();
  });

  describe('catch', () => {
    it('should log a warning', () => {
      // Given
      const exception = new FcException('message text');
      exception.scope = 2;
      exception.code = 3;
      // When
      exceptionFilter.catch(exception, argumentHostMock);
      // Then
      expect(loggerMock.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'FcException',
          code: 'Y020003',
          message: 'message text',
        }),
      );
    });

    it('should concat stack trace from original error', () => {
      // Given
      const exception = new FcException();
      exception.scope = 2;
      exception.code = 3;
      exception.originalError = new Error('foo bar');
      // When
      exceptionFilter.catch(exception, argumentHostMock);
      // Then
      expect(loggerMock.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'FcException',
          code: 'Y020003',
          stackTrace: expect.any(Array),
        }),
      );
    });

    it('should render error template', () => {
      // Given
      const exception = new FcException('message text');
      exception.scope = 2;
      exception.code = 3;
      // When
      exceptionFilter.catch(exception, argumentHostMock);
      // Then
      expect(resMock.render).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({
          code: 'Y020003',
          message: 'message text',
        }),
      );
    });

    it('should not log error', () => {
      // Given
      class ExceptionClass extends FcException {
        isBusiness = true;
      }
      const exception = new ExceptionClass('message text');
      exception.scope = 2;
      exception.code = 3;
      exceptionFilter['logException'] = jest.fn();
      // When
      exceptionFilter.catch(exception, argumentHostMock);
      // Then
      expect(exceptionFilter['logException']).toHaveBeenCalledTimes(1);
      expect(resMock.render).toHaveBeenCalled();
    });

    it('should not render for redirections', () => {
      // Given
      const exception = new FcException('message text');
      exception.scope = 2;
      exception.code = 3;
      exception.redirect = true;
      // When
      exceptionFilter.catch(exception, argumentHostMock);
      // Then
      expect(resMock.render).not.toHaveBeenCalled();
    });
  });

  describe('ArgumentHostAdapter', () => {
    it('should provide a fake argument adapter with switchToHttp method', () => {
      // Given
      const ctx = { res: {} };
      // When
      const result = FcExceptionFilter.ArgumentHostAdapter(ctx);
      // Then
      expect(result).toBeDefined();
      expect(typeof result.switchToHttp).toBe('function');
    });
    it('should provide a fake argument adapter with a getResponse method in response to switchToHttp', () => {
      // Given
      const ctx = { res: {} };
      const adapter = FcExceptionFilter.ArgumentHostAdapter(ctx);
      const httpAdapter = adapter.switchToHttp();
      // When
      const result = httpAdapter.getResponse();
      // Then
      expect(result).toBeDefined();
      expect(result).toBe(ctx.res);
    });
  });
});
