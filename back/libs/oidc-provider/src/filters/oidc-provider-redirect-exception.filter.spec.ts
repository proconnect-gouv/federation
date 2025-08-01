import { Request, Response } from 'express';

import { ArgumentsHost } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@fc/config';
import { ExceptionCaughtEvent } from '@fc/exceptions/events';
import { generateErrorId } from '@fc/exceptions/helpers';
import { LoggerService } from '@fc/logger';
import { SERVICE_PROVIDER_SERVICE_TOKEN } from '@fc/oidc';
import { SessionService } from '@fc/session';

import { getConfigMock } from '@mocks/config';
import { getLoggerMock } from '@mocks/logger';
import { getSessionServiceMock } from '@mocks/session';

import { OidcProviderBaseRedirectException } from '../exceptions';
import { OidcProviderService } from '../oidc-provider.service';
import { OidcProviderRedirectExceptionFilter } from './oidc-provider-redirect-exception.filter';

jest.mock('@fc/exceptions/helpers', () => ({
  ...jest.requireActual('@fc/exceptions/helpers'),
  generateErrorId: jest.fn(),
}));

describe('OidcProviderRedirectExceptionFilter', () => {
  let filter: OidcProviderRedirectExceptionFilter;

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

  class ExceptionMock extends OidcProviderBaseRedirectException {
    public error = 'ERROR';
    public error_description = 'ERROR_DESCRIPTION';
  }

  const resMock = {
    set: jest.fn(),
    status: jest.fn(),
    redirect: jest.fn(),
  };

  const redirectUriMock = 'https://example.com/redirect_uri/mock';
  const reqMock = {
    query: { redirect_uri: redirectUriMock },
  };

  const codeMock = Symbol('code');
  const idMock = Symbol('id');

  const serviceProviderMock = {
    getList: jest.fn(),
  };

  const oidcProviderServiceMock = { abortInteraction: jest.fn() };

  let originalErrorMock: Error;
  let exceptionMock: ExceptionMock;

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OidcProviderRedirectExceptionFilter,
        ConfigService,
        SessionService,
        LoggerService,
        EventBus,
        OidcProviderService,
        {
          provide: SERVICE_PROVIDER_SERVICE_TOKEN,
          useValue: serviceProviderMock,
        },
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(configMock)
      .overrideProvider(SessionService)
      .useValue(sessionMock)
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .overrideProvider(EventBus)
      .useValue(eventBusMock)
      .overrideProvider(OidcProviderService)
      .useValue(oidcProviderServiceMock)

      .compile();

    filter = module.get<OidcProviderRedirectExceptionFilter>(
      OidcProviderRedirectExceptionFilter,
    );

    filter['logException'] = jest.fn();
    filter['getExceptionCodeFor'] = jest.fn();
    filter['getExceptionCodeFor'] = jest.fn().mockReturnValue(codeMock);

    hostMock.switchToHttp.mockReturnThis();
    hostMock.getResponse.mockReturnValue(resMock);
    hostMock.getRequest.mockReturnValue(reqMock);

    resMock.status.mockReturnThis();

    generateErrorIdMock.mockReturnValue(idMock as unknown as string);

    originalErrorMock = new Error('originalErrorMockValue');
    exceptionMock = new ExceptionMock(originalErrorMock);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('catch', () => {
    const paramsMock = {
      error: 'error',
      error_description: 'error_description',
      code: codeMock,
      id: idMock,
    };

    beforeEach(() => {
      filter['getOidcParams'] = jest.fn().mockReturnValue(paramsMock);
      filter['manualRedirect'] = jest.fn();
    });

    it('should mark the original error as caught', async () => {
      // When
      await filter.catch(exceptionMock, hostMock as unknown as ArgumentsHost);

      // Then
      expect(exceptionMock.originalError.caught).toBe(true);
    });

    it('should log then exception', async () => {
      // When
      await filter.catch(exceptionMock, hostMock as unknown as ArgumentsHost);

      // Then
      expect(filter['logException']).toHaveBeenCalledExactlyOnceWith(
        codeMock,
        idMock,
        exceptionMock,
      );
    });

    it('should publish an ExceptionCaughtEvent', async () => {
      // When
      await filter.catch(exceptionMock, hostMock as unknown as ArgumentsHost);

      // Then
      expect(eventBusMock.publish).toHaveBeenCalledExactlyOnceWith(
        expect.any(ExceptionCaughtEvent),
      );
    });

    it('should try to abort interaction', async () => {
      // When
      await filter.catch(exceptionMock, hostMock as unknown as ArgumentsHost);

      // Then
      expect(
        oidcProviderServiceMock.abortInteraction,
      ).toHaveBeenCalledExactlyOnceWith(reqMock, resMock, paramsMock);
    });

    it('should redirect manually if abort interaction fails', async () => {
      // Given
      const abortErrorMock = new Error('abortErrorMockValue');
      oidcProviderServiceMock.abortInteraction.mockRejectedValue(
        abortErrorMock,
      );

      // When
      await filter.catch(exceptionMock, hostMock as unknown as ArgumentsHost);

      // Then
      expect(filter['manualRedirect']).toHaveBeenCalledExactlyOnceWith(
        reqMock,
        resMock,
        paramsMock,
        exceptionMock,
      );
    });
  });

  describe('getOidcParams', () => {
    it('should return an object with error, error_description, code and id', () => {
      // When
      const result = filter['getOidcParams'](exceptionMock);

      // Then
      expect(result).toEqual({
        error: 'ERROR',
        error_description: 'ERROR_DESCRIPTION',
        code: codeMock,
        id: idMock,
      });
    });

    it('should return an object with error, error_description from error instance if they are set', () => {
      // Given
      const originalErrorWitMembers = new Error();

      Object.assign(originalErrorWitMembers, {
        error: 'member_error',
        error_description: 'member_error_description',
      });

      const exceptionWitMembers = new ExceptionMock(originalErrorWitMembers);

      // When
      const result = filter['getOidcParams'](exceptionWitMembers);

      // Then
      expect(result).toEqual({
        error: 'member_error',
        error_description: 'member_error_description',
        code: codeMock,
        id: idMock,
      });
    });
  });

  describe('manualRedirect', () => {
    const paramsMock = { foo: 'bar' };

    beforeEach(() => {
      filter['errorOutput'] = jest.fn();
      filter['isAuthorizedRedirectUrl'] = jest.fn().mockReturnValue(true);
      filter['getHttpStatus'] = jest.fn().mockReturnValue(500);
    });

    it('should call errorOutput if redirect_uri is not authorized', async () => {
      // Given
      filter['isAuthorizedRedirectUrl'] = jest.fn().mockReturnValue(false);

      // When
      await filter['manualRedirect'](
        reqMock as unknown as Request,
        resMock as unknown as Response,
        paramsMock,
        exceptionMock,
      );

      // Then
      expect(filter['errorOutput']).toHaveBeenCalledExactlyOnceWith({
        ...paramsMock,
        exception: exceptionMock,
        res: resMock,
        httpResponseCode: 500,
      });
    });

    it('should not call errorOutput if redirect_uri is authorized', async () => {
      // When
      await filter['manualRedirect'](
        reqMock as unknown as Request,
        resMock as unknown as Response,
        {},
        exceptionMock,
      );

      // Then
      expect(filter['errorOutput']).not.toHaveBeenCalled();
    });

    it('should redirect to redirect_uri if it is authorized', async () => {
      // Given
      const params = {
        error: 'ERROR',
        error_description: 'ERROR_DESCRIPTION',
        state: 'state',
      };
      const redirectUriWithParams = `${redirectUriMock}?error=ERROR&error_description=ERROR_DESCRIPTION&state=state`;

      // When
      await filter['manualRedirect'](
        reqMock as unknown as Request,
        resMock as unknown as Response,
        params,
        exceptionMock,
      );

      // Then
      expect(resMock.redirect).toHaveBeenCalledExactlyOnceWith(
        redirectUriWithParams,
      );
    });
  });

  describe('isAuthorizedRedirectUrl', () => {
    beforeEach(() => {
      serviceProviderMock.getList.mockReturnValue([
        {
          redirect_uris: ['https://good-example.com'],
        },
      ]);
    });

    it('should return false if the url is not defined', async () => {
      // When
      const result = await filter['isAuthorizedRedirectUrl'](undefined);

      // Then
      expect(result).toBe(false);
    });
    it('should return true if the url is authorized', async () => {
      // When
      const result = await filter['isAuthorizedRedirectUrl'](
        'https://good-example.com',
      );

      // Then
      expect(result).toBe(true);
    });

    it('should return false if the url is not authorized', async () => {
      // When
      const result = await filter['isAuthorizedRedirectUrl'](
        'https://bad-example.com',
      );

      // Then
      expect(result).toBe(false);
    });
  });
});
