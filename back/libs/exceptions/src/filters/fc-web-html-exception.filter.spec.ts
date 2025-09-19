import { Response } from 'express';

import { ArgumentsHost } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import { ApiErrorParams } from '@fc/app';
import { BaseException } from '@fc/base-exception';
import { ConfigService } from '@fc/config';
import { CoreFcaInvalidIdentityException } from '@fc/core';
import { ExceptionCaughtEvent } from '@fc/exceptions/events';
import { generateErrorId } from '@fc/exceptions/helpers';
import { LoggerService } from '@fc/logger';
import { OidcProviderNoWrapperException } from '@fc/oidc-provider';
import { SessionService } from '@fc/session';
import { TrackingMissingNetworkContextException } from '@fc/tracking/exceptions';

import { getConfigMock } from '@mocks/config';
import { getLoggerMock } from '@mocks/logger';
import { getSessionServiceMock } from '@mocks/session';

import { FcException } from '../exceptions';
import { FcWebHtmlExceptionFilter } from './fc-web-html-exception.filter';

jest.mock('@fc/exceptions/helpers', () => ({
  ...jest.requireActual('@fc/exceptions/helpers'),
  generateErrorId: jest.fn(),
}));

describe('FcWebHtmlExceptionFilter', () => {
  let filter: FcWebHtmlExceptionFilter;

  const generateErrorIdMock = jest.mocked(generateErrorId);

  const configMock = getConfigMock();
  const sessionMock = getSessionServiceMock();
  const loggerMock = getLoggerMock();
  const eventBusMock = {
    publish: jest.fn(),
  };

  const hostMock = {
    switchToHttp: jest.fn().mockReturnThis(),
    getRequest: jest.fn(),
    getResponse: jest.fn(),
  };

  class ExceptionMock extends FcException {
    error = 'ERROR';
    error_description = 'ERROR_DESCRIPTION';
    ui = 'some.message.code';
  }

  const resMock = {
    status: jest.fn(),
    render: jest.fn(),
  };

  const exceptionMock = new ExceptionMock();
  const codeMock = 'code';
  const idMock = 'id';

  const paramsMock: ApiErrorParams = {
    exception: exceptionMock,
    error: { id: idMock, code: codeMock, message: 'some.message.code' },
    res: resMock as unknown as Response,
    idpName: undefined,
    spName: undefined,
    httpResponseCode: 500,
    errorDetail: undefined,
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FcWebHtmlExceptionFilter,
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

    filter = module.get<FcWebHtmlExceptionFilter>(FcWebHtmlExceptionFilter);

    filter['logException'] = jest.fn();
    filter['getExceptionCodeFor'] = jest.fn().mockReturnValue(codeMock);

    hostMock.switchToHttp.mockReturnThis();
    hostMock.getResponse.mockReturnValue(resMock);
    generateErrorIdMock.mockReturnValue(idMock as unknown as string);

    resMock.status.mockReturnThis();
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
      expect(filter['errorOutput']).toHaveBeenCalledExactlyOnceWith(paramsMock);
    });

    it('should output an OidcProviderNoWrapperException too', () => {
      // When
      const wrapped = new OidcProviderNoWrapperException(new Error());
      filter.catch(wrapped, hostMock as unknown as ArgumentsHost);

      // Then
      const expected = {
        ...paramsMock,
        exception: wrapped,
        error: { ...paramsMock.error, message: 'Error' },
      };
      expect(filter['errorOutput']).toHaveBeenCalledExactlyOnceWith(expected);
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

    it('should render the error template with a static exception', () => {
      // When
      const inputMock = {
        ...paramsMock,
        exception: new TrackingMissingNetworkContextException(),
        error: {
          message: 'TrackingContext.exceptions.trackingMissingNetworkContext',
        },
      };
      filter['errorOutput'](inputMock as unknown as ApiErrorParams);

      // Then
      expect(resMock.render).toHaveBeenCalledWith('error', {
        ...inputMock,
        errorDetail: 'Missing network context (headers)',
      });
    });

    it('should render the error template with a UI-less static exception', () => {
      // When
      const inputMock = {
        ...paramsMock,
        exception: new CoreFcaInvalidIdentityException('anyone'),
        error: {
          message: undefined,
        },
      };
      filter['errorOutput'](inputMock as unknown as ApiErrorParams);

      // Then
      expect(resMock.render).toHaveBeenCalledWith('error', {
        ...inputMock,
        errorDetail: undefined,
      });
    });

    it('should render the error template with a generic exception', () => {
      // When
      const inputMock = {
        ...paramsMock,
        error: { message: 'invalid_scope' },
        exception: { generic: true, error_description: 'invalid scopes' },
      };
      filter['errorOutput'](inputMock as unknown as ApiErrorParams);

      // Then
      expect(resMock.render).toHaveBeenCalledWith('error', {
        ...inputMock,
        errorDetail: 'invalid scopes',
      });
    });

    it('should render the error template with a missing exception code', () => {
      // When
      const input = {
        ...paramsMock,
        exception: new BaseException(),
        error: { ...paramsMock.error, code: undefined, message: undefined },
      };
      filter['errorOutput'](input as unknown as ApiErrorParams);

      // Then
      expect(resMock.render).toHaveBeenCalledWith('error', {
        ...input,
        errorDetail: undefined,
      });
    });
  });
});
