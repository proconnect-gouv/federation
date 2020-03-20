import { ArgumentsHost } from '@nestjs/common';
import { LoggerService } from '@fc/logger';
import { UnhandledExceptionFilter } from './unhandled.exception-filter';

describe(' UnhandledExceptionFilter', () => {
  let exceptionFilter: UnhandledExceptionFilter;
  const loggerMock = ({
    debug: jest.fn(),
    error: jest.fn(),
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
    exceptionFilter = new UnhandledExceptionFilter(loggerMock);
    jest.resetAllMocks();
  });

  describe('catch', () => {
    it('should log an error', () => {
      // Given
      const exception = new Error('message text');
      // When
      exceptionFilter.catch(exception, argumentHostMock);
      // Then
      expect(loggerMock.error).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'Error',
          code: 'Y000000',
          message: 'message text',
        }),
      );
    });
    it('should render error template', () => {
      // Given
      const exception = new Error('message text');
      // When
      exceptionFilter.catch(exception, argumentHostMock);
      // Then
      expect(resMock.render).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({
          code: 'Y000000',
          message: 'message text',
        }),
      );
    });
  });
});
