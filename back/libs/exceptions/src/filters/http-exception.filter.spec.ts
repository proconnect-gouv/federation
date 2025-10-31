import {
  ArgumentsHost,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@fc/config';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';

import { getConfigMock } from '@mocks/config';
import { getLoggerMock } from '@mocks/logger';
import { getSessionServiceMock } from '@mocks/session';

import { generateErrorId } from '../helpers';
import { HttpExceptionFilter } from './http-exception.filter';

jest.mock('../helpers', () => ({
  ...jest.requireActual('../helpers'),
  generateErrorId: jest.fn(),
}));

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  const generateErrorIdMock = jest.mocked(generateErrorId);

  const configMock = getConfigMock();
  const loggerMock = getLoggerMock();
  const sessionMock = getSessionServiceMock();

  const hostMock = {
    switchToHttp: jest.fn().mockReturnThis(),
    getRequest: jest.fn(),
    getResponse: jest.fn(),
  };

  let exceptionMock: HttpException;

  const resMock = {
    status: jest.fn(),
    render: jest.fn(),
  } as any;

  const idMock = 'error-id-123';

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HttpExceptionFilter,
        ConfigService,
        SessionService,
        LoggerService,
      ],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .overrideProvider(SessionService)
      .useValue(sessionMock)
      .overrideProvider(ConfigService)
      .useValue(configMock)
      .compile();

    filter = module.get<HttpExceptionFilter>(HttpExceptionFilter);

    hostMock.switchToHttp.mockReturnThis();
    hostMock.getResponse.mockReturnValue(resMock);

    generateErrorIdMock.mockReturnValue(idMock);

    resMock.status.mockReturnThis();
    configMock.get.mockReturnValue({ prefix: 'Y' });

    exceptionMock = new HttpException('message', 500);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('catch', () => {
    it('should log the exception with code, id, message and original exception', () => {
      // When
      filter.catch(exceptionMock, hostMock as unknown as ArgumentsHost);

      // Then
      expect(loggerMock.error).toHaveBeenCalledOnce();
    });

    it('should output the error with error object, exception and response', () => {
      // When
      filter.catch(exceptionMock, hostMock as unknown as ArgumentsHost);

      // Then
      expect(resMock.render).toHaveBeenCalledOnce();
    });

    it('should join BadRequestException messages into a single message', () => {
      // Given
      const badRequest = new BadRequestException({
        message: ['first error', 'second error'],
      } as any);

      // When
      filter.catch(badRequest, hostMock as unknown as ArgumentsHost);

      // Then
      expect(loggerMock.error).toHaveBeenCalledOnce();
      expect(resMock.render).toHaveBeenCalledOnce();
    });
  });
});
