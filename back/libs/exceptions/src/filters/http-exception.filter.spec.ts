import { ArgumentsHost, HttpException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@fc/config';
import { ExceptionCaughtEvent } from '@fc/exceptions/events';
import { generateErrorId } from '@fc/exceptions/helpers';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';

import { getConfigMock } from '@mocks/config';
import { getLoggerMock } from '@mocks/logger';
import { messageDictionary } from '../../../../apps/core-fca/src/exceptions/error-messages';
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
  const eventBusMock = {
    publish: jest.fn(),
  };

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
    dictionary: messageDictionary,
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
        EventBus,
      ],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .overrideProvider(SessionService)
      .useValue(sessionMock)
      .overrideProvider(ConfigService)
      .useValue(configMock)
      .overrideProvider(EventBus)
      .useValue(eventBusMock)
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
      filter['getParams'] = jest.fn().mockReturnValue(paramsMock);
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

    it('should publish an ExceptionCaughtEvent', () => {
      // When
      filter.catch(exceptionMock, hostMock as unknown as ArgumentsHost);

      // Then
      expect(eventBusMock.publish).toHaveBeenCalledExactlyOnceWith(
        expect.any(ExceptionCaughtEvent),
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
