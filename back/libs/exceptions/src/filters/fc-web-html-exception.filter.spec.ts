import { Response } from 'express';

import { ArgumentsHost } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@fc/config';
import { CoreFcaInvalidIdentityException } from '@fc/core';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';

import { getConfigMock } from '@mocks/config';
import { getLoggerMock } from '@mocks/logger';
import { getSessionServiceMock } from '@mocks/session';

import { BaseException } from '../exceptions/base.exception';
import { CoreFcaBaseException } from '../exceptions/core-fca-base.exception';
import { generateErrorId } from '../helpers/';
import { FcWebHtmlExceptionFilter } from './fc-web-html-exception.filter';

jest.mock('../helpers/', () => ({
  ...jest.requireActual('../helpers/'),
  generateErrorId: jest.fn(),
}));

describe('FcWebHtmlExceptionFilter', () => {
  let filter: FcWebHtmlExceptionFilter;

  const generateErrorIdMock = jest.mocked(generateErrorId);

  const configMock = getConfigMock();
  const sessionMock = getSessionServiceMock();
  const loggerMock = getLoggerMock();

  const hostMock = {
    switchToHttp: jest.fn().mockReturnThis(),
    getRequest: jest.fn(),
    getResponse: jest.fn(),
  };

  class ExceptionMock extends CoreFcaBaseException {
    error = 'ERROR';
    error_description = 'ERROR_DESCRIPTION';
    ui = 'some.message.code';
  }

  const resMock = {
    status: jest.fn(),
    render: jest.fn(),
  };

  const exceptionMock = new ExceptionMock();
  const idMock = 'id';

  const paramsMock = {
    exception: exceptionMock,
    error: { id: idMock, code: 'ERROR', message: 'ERROR_DESCRIPTION' },
    res: resMock as unknown as Response,
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
      ],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .overrideProvider(SessionService)
      .useValue(sessionMock)
      .overrideProvider(ConfigService)
      .useValue(configMock)
      .compile();

    filter = module.get<FcWebHtmlExceptionFilter>(FcWebHtmlExceptionFilter);

    hostMock.switchToHttp.mockReturnThis();
    hostMock.getResponse.mockReturnValue(resMock);
    configMock.get.mockReturnValue({ prefix: 'Y' });
    generateErrorIdMock.mockReturnValue(idMock as unknown as string);

    resMock.status.mockReturnThis();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('catch', () => {
    beforeEach(() => {
      filter['errorOutput'] = jest.fn();
    });

    it('should log the exception', () => {
      // When
      filter.catch(exceptionMock, hostMock as unknown as ArgumentsHost);
      // Force generic to ensure message comes from error_description deterministically
      exceptionMock.generic = true;
      exceptionMock.ui = undefined;

      // Then
      expect(loggerMock.error).toHaveBeenCalledOnce();
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
      filter['errorOutput'](paramsMock as any);

      // Then
      expect(resMock.status).toHaveBeenCalledOnce();
      expect(resMock.status).toHaveBeenCalledWith(500);
    });

    it('should render the error template with a UI-less static CoreFca exception', () => {
      // When
      const coreFcaException = new CoreFcaInvalidIdentityException('anyone');
      const inputMock = {
        ...paramsMock,
        exception: coreFcaException,
        error: {
          ...paramsMock.error,
          message: undefined,
        },
      };
      filter['errorOutput'](inputMock as any);

      // Then
      expect(resMock.render).toHaveBeenCalledTimes(1);
      const [, renderParams] = resMock.render.mock.calls[0];
      expect(resMock.render).toHaveBeenCalledWith('error', expect.any(Object));
      expect(renderParams).toEqual(
        expect.objectContaining({
          error: inputMock.error,
          exceptionDisplay: expect.objectContaining({
            title: expect.any(String),
            description: expect.any(String),
            displayContact: expect.any(Boolean),
          }),
        }),
      );
    });

    it('should render the error template with a generic exception (no CoreFca display)', () => {
      // When
      const inputMock = {
        ...paramsMock,
        error: { ...paramsMock.error, message: 'invalid_scope' },
        exception: Object.assign(new BaseException(), {
          generic: true,
          error_description: 'invalid scopes',
        }),
      };
      filter['errorOutput'](inputMock as any);

      // Then
      expect(resMock.render).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({
          error: inputMock.error,
          exceptionDisplay: {},
        }),
      );
    });

    it('should render the error template even with a missing exception code', () => {
      // When
      const input = {
        ...paramsMock,
        exception: new BaseException(),
        error: { ...paramsMock.error, code: undefined, message: undefined },
      };
      filter['errorOutput'](input as any);

      // Then
      expect(resMock.render).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({
          error: input.error,
        }),
      );
    });

    it('should render no contactHref', () => {
      // When
      const inputMock = {
        ...paramsMock,
        error: { ...paramsMock.error, message: 'invalid_scope' },
        exception: Object.assign(new ExceptionMock(), {
          displayContact: false,
        }),
      };
      filter['errorOutput'](inputMock as any);

      // Then
      expect(resMock.render).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({
          exceptionDisplay: {
            contactHref: undefined,
            contactMessage:
              'Vous pouvez nous signaler cette erreur en nous écrivant.',
            description:
              'Nous n’arrivons pas à vous connecter à votre service en ligne pour l’instant.',
            displayContact: false,
            illustration: 'default-error',
            title: 'Accès impossible',
          },
        }),
      );
    });
  });

  describe('getDefaultContactHref', () => {
    it('should render href with params', () => {
      // When
      const input = { code: 'code', id: 'id', message: 'message' };

      // Then
      expect(filter['getDefaultContactHref'](input)).toBeString();
    });

    it('should render href without params', () => {
      // When
      const input = { code: null, id: null, message: null };

      // Then
      expect(filter['getDefaultContactHref'](input)).toBeString();
    });
  });
});
