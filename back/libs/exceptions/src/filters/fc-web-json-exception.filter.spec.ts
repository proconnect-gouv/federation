import { ArgumentsHost } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ApiErrorParams } from '@fc/app';
import { ConfigService } from '@fc/config';
import { generateErrorId } from '@fc/exceptions/helpers';
import { LoggerService } from '@fc/logger';

import { getConfigMock } from '@mocks/config';
import { getLoggerMock } from '@mocks/logger';

import { FcException } from '../exceptions';
import { FcWebJsonExceptionFilter } from './fc-web-json-exception.filter';

jest.mock('@fc/exceptions/helpers', () => ({
  ...jest.requireActual('@fc/exceptions/helpers'),
  generateErrorId: jest.fn(),
}));

describe('FcWebJsonExceptionFilter', () => {
  let filter: FcWebJsonExceptionFilter;

  const generateErrorIdMock = jest.mocked(generateErrorId);

  const configMock = getConfigMock();
  const loggerMock = getLoggerMock();

  const hostMock = {
    switchToHttp: jest.fn().mockReturnThis(),
    getRequest: jest.fn(),
    getResponse: jest.fn(),
  };

  class ExceptionMock extends FcException {
    error = 'ERROR';
    error_description = 'ERROR_DESCRIPTION';
    ui = 'some error message';
  }

  let exceptionMock: ExceptionMock;

  const resMock = {
    status: jest.fn(),
    json: jest.fn(),
  };

  const codeMock = Symbol('code');
  const idMock = Symbol('id');

  const paramsMock = {
    res: resMock,
    httpResponseCode: 500,
    error: {
      code: codeMock,
      id: idMock,
      message: 'some error message',
    },
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [FcWebJsonExceptionFilter, ConfigService, LoggerService],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .overrideProvider(ConfigService)
      .useValue(configMock)
      .compile();

    filter = module.get<FcWebJsonExceptionFilter>(FcWebJsonExceptionFilter);

    filter['logException'] = jest.fn();
    filter['getExceptionCodeFor'] = jest.fn().mockReturnValue(codeMock);

    hostMock.switchToHttp.mockReturnThis();
    hostMock.getResponse.mockReturnValue(resMock);
    generateErrorIdMock.mockReturnValue(idMock as unknown as string);

    resMock.status.mockReturnThis();

    exceptionMock = new ExceptionMock();

    Object.assign(exceptionMock, {
      error: 'error',
      error_description: 'error_description',
      error_detail: 'error_detail',
    });

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
      expect(filter['errorOutput']).toHaveBeenCalledExactlyOnceWith(paramsMock);
    });
  });

  describe('errorOutput', () => {
    it('should set the status to 500', () => {
      // When
      filter['errorOutput'](paramsMock as unknown as ApiErrorParams);

      // Then
      expect(resMock.status).toHaveBeenCalledOnce();
      expect(resMock.status).toHaveBeenCalledWith(500);
    });

    it('should send the error in JSON', () => {
      // When
      filter['errorOutput'](paramsMock as unknown as ApiErrorParams);

      // Then
      expect(resMock.json).toHaveBeenCalledExactlyOnceWith({
        ...paramsMock.error,
        error: exceptionMock['error'],
        error_description: exceptionMock['error_description'],
        error_detail: exceptionMock['error_detail'],
      });
    });
  });
});
