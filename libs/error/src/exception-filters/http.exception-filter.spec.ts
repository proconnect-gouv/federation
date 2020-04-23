import { ArgumentsHost } from '@nestjs/common';
import { LoggerService } from '@fc/logger';
import { HttpExceptionFilter } from './http.exception-filter';
import { HttpException } from '../exceptions';

describe('HttpExceptionFilter', () => {
  let exceptionFilter: HttpExceptionFilter;
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
    exceptionFilter = new HttpExceptionFilter(loggerMock);
    jest.resetAllMocks();
  });

  describe('catch', () => {
    it('should log an error', () => {
      // Given
      const exception = new HttpException('message text', 400);
      // When
      exceptionFilter.catch(exception, argumentHostMock);
      // Then
      expect(loggerMock.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'HttpException',
          code: 'Y000400',
          message: 'message text',
        }),
      );
    });
    it('should render error template', () => {
      // Given
      const exception = new HttpException('message text', 403);
      // When
      exceptionFilter.catch(exception, argumentHostMock);
      // Then
      expect(resMock.render).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({
          code: 'Y000403',
          message: 'message text',
        }),
      );
    });
  });
});
