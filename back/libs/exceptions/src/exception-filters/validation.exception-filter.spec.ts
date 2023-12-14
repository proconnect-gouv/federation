import { ConfigService } from '@fc/config';
import { LoggerService } from '@fc/logger';

import { getLoggerMock } from '@mocks/logger';

import { FcException, ValidationException } from '../exceptions';
import { ValidationExceptionFilter } from './validation.exception-filter';

describe('ValidationExceptionFilter', () => {
  let exceptionFilter: ValidationExceptionFilter;
  const loggerMock = getLoggerMock();

  const apiOutputContentTypeValueMock = 'html';
  const configServiceMock = {} as unknown as ConfigService;
  configServiceMock.get = jest.fn().mockReturnValue({
    apiOutputContentType: apiOutputContentTypeValueMock,
  });

  const resMock: any = {};
  resMock.render = jest.fn().mockReturnValue(resMock);
  resMock.status = jest.fn().mockReturnValue(resMock);

  beforeEach(() => {
    exceptionFilter = new ValidationExceptionFilter(
      configServiceMock,
      loggerMock as unknown as LoggerService,
    );
    jest.resetAllMocks();
  });

  describe('catch()', () => {
    it('should throw an FcException', () => {
      // Given
      const errors = [];
      const exception = new ValidationException(errors);
      // Then
      expect(() => exceptionFilter.catch(exception)).toThrow(FcException);
    });
  });
});
