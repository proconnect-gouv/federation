import { errors } from 'oidc-provider';

import { HttpStatus } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@fc/config';
import { LoggerService } from '@fc/logger';
import { OidcProviderNoWrapperException } from '@fc/oidc-provider';

import { getConfigMock } from '@mocks/config';
import { getLoggerMock } from '@mocks/logger';

import { BaseException, HttpException, RpcException } from '../exceptions';
import { FcBaseExceptionFilter } from './fc-base.exception-filter';

describe('FcBaseExceptionFilter', () => {
  let filter: FcBaseExceptionFilter;

  class FcBaseExceptionFilterImplementation extends FcBaseExceptionFilter {}

  const configMock = getConfigMock();
  const loggerMock = getLoggerMock();
  const eventBusMock = {
    publish: jest.fn(),
  };

  const prefixMock = 'Z';
  const scopeMock = 42;
  const codeMock = 1337;

  class ExceptionMock extends BaseException {
    public scope = scopeMock;
    public code = codeMock;
    public error = 'ERROR';
    public error_description = 'ERROR_DESCRIPTION';
  }

  let originalErrorMock: Error;
  let exceptionMock: BaseException;

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FcBaseExceptionFilterImplementation,
        ConfigService,
        LoggerService,
        EventBus,
      ],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .overrideProvider(ConfigService)
      .useValue(configMock)
      .overrideProvider(EventBus)
      .useValue(eventBusMock)
      .compile();

    filter = module.get<FcBaseExceptionFilterImplementation>(
      FcBaseExceptionFilterImplementation,
    );

    originalErrorMock = new Error('originalErrorMockValue');
    exceptionMock = new ExceptionMock(originalErrorMock);

    configMock.get.mockReturnValue({ prefix: prefixMock });
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('getHttpStatus', () => {
    it('should return the status code from _inner_ statusCode property of OidcProviderNoWrapperException', () => {
      // Given
      const wrapped = new errors.OIDCProviderError(418, 'teapot');
      const statusCodeException = new OidcProviderNoWrapperException(wrapped);

      // When
      const result = filter['getHttpStatus'](statusCodeException);

      // Then
      expect(result).toBe(HttpStatus.I_AM_A_TEAPOT);
    });

    it('should ignore the default status given as argument if the class has a status', () => {
      // Given
      const defaultValue = Symbol('defaultValue') as unknown as number;
      const defaultException = new BaseException();

      // When
      const result = filter['getHttpStatus'](defaultException, defaultValue);

      // Then
      expect(result).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should return the default status given as argument as a last resort', () => {
      // Given
      const defaultValue = Symbol('defaultValue') as unknown as number;
      const defaultException = {} as unknown as BaseException;

      // When
      const result = filter['getHttpStatus'](defaultException, defaultValue);

      // Then
      expect(result).toBe(defaultValue);
    });

    it('should return the (inner) default status given as argument as a last resort', () => {
      // Given
      const defaultValue = Symbol('defaultValue') as unknown as number;
      const defaultException = {} as unknown as BaseException;
      const wrapper = new OidcProviderNoWrapperException(defaultException);

      // When
      const result = filter['getHttpStatus'](wrapper, defaultValue);

      // Then
      expect(result).toBe(defaultValue);
    });

    it('should return HttpStatus.INTERNAL_SERVER_ERROR if nothing is found not passed as argument', () => {
      // Given
      const defaultException = new BaseException();

      // When
      const result = filter['getHttpStatus'](defaultException);

      // Then
      expect(result).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('logException', () => {
    it('should log the exception', () => {
      // When
      filter['logException']('codeMock', 'idMock', exceptionMock);

      // Then
      expect(loggerMock.err).toHaveBeenCalledTimes(1);
    });
  });

  describe('getExceptionCodeFor', () => {
    it('should return the Y/scope/code nomenclature for known exceptions', () => {
      // When
      const result = filter['getExceptionCodeFor'](exceptionMock);

      // Then
      expect(result).toEqual(`${prefixMock}${scopeMock}${codeMock}`);
    });

    it('should return the dynamic exception code otherwise', () => {
      const idpException = new BaseException();
      idpException.error = 'invalid_scope';
      idpException.generic = true;

      const result = filter['getExceptionCodeFor'](idpException);

      // Then
      expect(result).toEqual('invalid_scope');
    });

    it('should use the class name if the exception is an OidcProviderNoWrapperException', () => {
      // Given
      const wrapper = new OidcProviderNoWrapperException(new Error());
      // When
      const result = filter['getExceptionCodeFor'](wrapper);

      // Then
      expect(result).toEqual('Error');
    });

    it('should use the HTTP status code if the exception is an HttpException', () => {
      // Given
      const httpExceptionMock = new HttpException(
        'message',
        HttpStatus.NOT_FOUND,
      );
      // When
      const result = filter['getExceptionCodeFor'](httpExceptionMock);

      // Then
      expect(result).toEqual(`${prefixMock}000${HttpStatus.NOT_FOUND}`);
    });

    it('should use the HTTP status code if the exception is an RpcException', () => {
      // Given
      const httpExceptionMock = new RpcException('message');
      // When
      const result = filter['getExceptionCodeFor'](httpExceptionMock);

      // Then
      expect(result).toEqual(`${prefixMock}000000`);
    });
  });
});
