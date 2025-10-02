import { ArgumentsHost, HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@fc/config';
import { generateErrorId } from '@fc/exceptions/helpers';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';

import { getConfigMock } from '@mocks/config';
import { getLoggerMock } from '@mocks/logger';
import { getSessionServiceMock } from '@mocks/session';

import { HttpExceptionFilter } from './http-exception.filter';

jest.mock('@fc/exceptions/helpers', () => ({
  ...jest.requireActual('@fc/exceptions/helpers'),
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
  };

  const codeMock = Symbol('code');
  const idMock = Symbol('id');

  const paramsMock = {
    res: resMock,
    httpResponseCode: 500,
    error: {
      code: codeMock,
      id: idMock,
      message: 'exceptions.http.500',
    },
    errorDetail: '',
  };

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

    filter['logException'] = jest.fn();
    filter['errorOutput'] = jest.fn();
    filter['getExceptionCodeFor'] = jest.fn().mockReturnValue(codeMock);

    hostMock.switchToHttp.mockReturnThis();
    hostMock.getResponse.mockReturnValue(resMock);
    generateErrorIdMock.mockReturnValue(idMock as unknown as string);

    resMock.status.mockReturnThis();

    exceptionMock = new HttpException('message', 500);

    Object.assign(paramsMock, { exception: exceptionMock });
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('catch', () => {
    beforeEach(() => {
      filter['shouldNotRedirect'] = jest.fn().mockReturnValue(false);
      filter['errorOutput'] = jest.fn();
    });

    it('should log the exception', () => {
      // When
      filter.catch(exceptionMock, hostMock as unknown as ArgumentsHost);

      // Then
      expect(filter['logException']).toHaveBeenCalledExactlyOnceWith(
        codeMock,
        idMock,
        exceptionMock,
      );
    });

    it('should output the error', () => {
      // When
      filter.catch(exceptionMock, hostMock as unknown as ArgumentsHost);

      // Then
      expect(filter['errorOutput']).toHaveBeenCalledWith(paramsMock);
    });
  });
});
