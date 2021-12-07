import { mocked } from 'ts-jest/utils';

import { ValidationError } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { validateDto } from '@fc/common';
import { LoggerService } from '@fc/logger';
import { MessageType } from '@fc/rie';

import {
  RieBrokerProxyCsmrException,
  RieBrokerProxyMissingVariableException,
} from '../exceptions';
import { BrokerProxyService } from '../services';
import { BrokerProxyController } from './broker-proxy.controller';

jest.mock('@fc/common');

describe('BrokerProxyController', () => {
  let controller: BrokerProxyController;

  const brokerProxyServiceMock = {
    proxyRequest: jest.fn(),
    setHeaders: jest.fn(),
  };

  const loggerServiceMock = {
    setContext: jest.fn(),
    trace: jest.fn(),
    debug: jest.fn(),
  } as unknown as LoggerService;

  const reqMock = {
    originalUrl: '/fizz',
    method: '',
  };
  const resMock = {
    status: jest.fn(),
  };
  const sendMock = { send: jest.fn() };

  const bodyMock = 'foo=bar&toto=titi';
  const headersMock = { host: 'url.com', 'x-forwarded-proto': 'https' };

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BrokerProxyController],
      providers: [LoggerService, BrokerProxyService],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(BrokerProxyService)
      .useValue(brokerProxyServiceMock)
      .compile();

    controller = module.get<BrokerProxyController>(BrokerProxyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('get()', () => {
    it('should log URL idp called and call allRequest private method', async () => {
      // Given
      controller['allRequest'] = jest.fn();

      // When
      await controller.get(reqMock, headersMock, resMock);

      // Then
      expect(loggerServiceMock.debug).toHaveBeenCalledTimes(1);
      expect(loggerServiceMock.debug).toHaveBeenCalledWith(
        'GET https://url.com/fizz',
      );
      expect(controller['allRequest']).toHaveBeenCalledTimes(1);
      expect(controller['allRequest']).toHaveBeenCalledWith(
        reqMock,
        headersMock,
        resMock,
      );
    });
  });

  describe('post()', () => {
    it('should log URL idp called', async () => {
      // Given
      controller['allRequest'] = jest.fn();

      // When
      await controller.post(reqMock, headersMock, resMock, bodyMock);

      // Then
      expect(loggerServiceMock.debug).toHaveBeenCalledTimes(1);
      expect(loggerServiceMock.debug).toHaveBeenCalledWith(
        'POST https://url.com/fizz',
      );
    });
  });

  describe('allRequest()', () => {
    let handleMessageMock;
    let handleErrorMock;

    beforeEach(() => {
      handleMessageMock = jest.spyOn<BrokerProxyController, any>(
        controller,
        'handleMessage',
      );
      handleMessageMock.mockResolvedValueOnce();
      handleErrorMock = jest.spyOn<BrokerProxyController, any>(
        controller,
        'handleError',
      );
      handleErrorMock.mockResolvedValueOnce();
    });
    it('should call broker proxy service without body', async () => {
      // Given
      reqMock.method = 'GET';

      brokerProxyServiceMock.proxyRequest.mockResolvedValueOnce({
        type: MessageType.DATA,
        data: {
          headers: {
            fizz: 'bud',
          },
          status: 200,
          data: {
            foo: 'bar',
          },
        },
      });

      // When
      await controller['allRequest'](reqMock, headersMock, resMock);

      // Then
      expect(brokerProxyServiceMock.proxyRequest).toHaveBeenCalledTimes(1);
      expect(brokerProxyServiceMock.proxyRequest).toHaveBeenCalledWith(
        '/fizz',
        'GET',
        { host: 'url.com', 'x-forwarded-proto': 'https' },
        undefined,
      );

      expect(handleMessageMock).toHaveBeenCalledTimes(1);
      expect(handleErrorMock).toHaveBeenCalledTimes(0);
      expect(handleMessageMock).toHaveBeenCalledWith(resMock, {
        data: { foo: 'bar' },
        headers: { fizz: 'bud' },
        status: 200,
      });
    });

    it('should call broker proxy service with a body', async () => {
      // Given
      reqMock.method = 'POST';

      brokerProxyServiceMock.proxyRequest.mockResolvedValueOnce({
        type: MessageType.DATA,
        data: {
          headers: {
            fizz: 'bud',
          },
          status: 200,
          data: {
            // oidc variable name
            // eslint-disable-next-line @typescript-eslint/naming-convention
            access_token: 'access_token',
            // oidc variable name
            // eslint-disable-next-line @typescript-eslint/naming-convention
            id_token: 'id_token',
            // oidc variable name
            // eslint-disable-next-line @typescript-eslint/naming-convention
            token_type: 'token_type',
          },
        },
      });

      // When
      await controller.post(reqMock, headersMock, resMock, bodyMock);

      // Then
      expect(brokerProxyServiceMock.proxyRequest).toHaveBeenCalledTimes(1);
      expect(brokerProxyServiceMock.proxyRequest).toHaveBeenCalledWith(
        '/fizz',
        'POST',
        { host: 'url.com', 'x-forwarded-proto': 'https' },
        'foo=bar&toto=titi',
      );

      expect(handleMessageMock).toHaveBeenCalledTimes(1);
      expect(handleErrorMock).toHaveBeenCalledTimes(0);
      expect(handleMessageMock).toHaveBeenCalledWith(resMock, {
        headers: {
          fizz: 'bud',
        },
        status: 200,
        data: {
          // oidc variable name
          // eslint-disable-next-line @typescript-eslint/naming-convention
          access_token: 'access_token',
          // oidc variable name
          // eslint-disable-next-line @typescript-eslint/naming-convention
          id_token: 'id_token',
          // oidc variable name
          // eslint-disable-next-line @typescript-eslint/naming-convention
          token_type: 'token_type',
        },
      });
    });

    it('should call Error handler if the request failed on external resource', async () => {
      // Given
      reqMock.method = 'POST';

      brokerProxyServiceMock.proxyRequest.mockResolvedValueOnce({
        type: MessageType.ERROR,
        data: {
          code: 1000,
          name: 'UnknownBrokerError',
          reason: 'Something weird happened and I do not know why',
        },
      });

      // When
      await controller.post(reqMock, headersMock, resMock, bodyMock);

      // Then
      expect(brokerProxyServiceMock.proxyRequest).toHaveBeenCalledTimes(1);
      expect(brokerProxyServiceMock.proxyRequest).toHaveBeenCalledWith(
        '/fizz',
        'POST',
        { host: 'url.com', 'x-forwarded-proto': 'https' },
        'foo=bar&toto=titi',
      );

      expect(handleMessageMock).toHaveBeenCalledTimes(0);
      expect(handleErrorMock).toHaveBeenCalledTimes(1);
      expect(handleErrorMock).toHaveBeenCalledWith({
        code: 1000,
        name: 'UnknownBrokerError',
        reason: 'Something weird happened and I do not know why',
      });
    });
  });

  describe('handleMessage()', () => {
    const validateDtoMock = mocked(validateDto);

    it('should return HTTP message with headers from broker', async () => {
      // Given
      const correctMessage = {
        headers: {
          fizz: 'bud',
          test: 'testValue',
        },
        status: 200,
        data: null,
      };
      validateDtoMock.mockResolvedValueOnce([
        /* No error */
      ]);
      resMock.status.mockReturnValue(sendMock);

      // When
      await controller.handleMessage(resMock, correctMessage);

      // Then
      expect(brokerProxyServiceMock.setHeaders).toHaveBeenCalledTimes(1);
      expect(brokerProxyServiceMock.setHeaders).toHaveBeenCalledWith(
        resMock,
        correctMessage.headers,
      );
    });
    it('should return HTTP message from broker message', async () => {
      // Given
      const correctMessage = {
        headers: {
          fizz: 'bud',
        },
        status: 200,
        data: {
          foo: 'bar',
        },
      };
      validateDtoMock.mockResolvedValueOnce([
        /* No error */
      ]);
      resMock.status.mockReturnValue(sendMock);

      // When
      await controller.handleMessage(resMock, correctMessage);

      // Then
      expect(resMock.status).toHaveBeenCalledTimes(1);
      expect(resMock.status).toHaveBeenCalledWith(200);
      expect(sendMock.send).toHaveBeenCalledTimes(1);
      expect(sendMock.send).toHaveBeenCalledWith({
        foo: 'bar',
      });
    });
    it('should fail to return HTTP message from broker message', async () => {
      // Given
      const falsyMessage = {
        Sarah: 'Connor',
      };

      validateDtoMock.mockResolvedValueOnce([
        new Error('Unknown Error') as unknown as ValidationError,
      ]);
      // When
      await expect(
        controller.handleMessage(resMock, falsyMessage),
        // Then
      ).rejects.toThrow(RieBrokerProxyMissingVariableException);
      expect(validateDtoMock).toHaveBeenCalledTimes(1);
      expect(brokerProxyServiceMock.setHeaders).toHaveBeenCalledTimes(0);
    });
  });

  describe('handleError()', () => {
    const validateDtoMock = mocked(validateDto);

    it('should throw format Error if Error message from Broker is miss formatted', async () => {
      // Given
      const falsyError = {
        Sarah: 'Connor',
      };

      validateDtoMock.mockResolvedValueOnce([
        new Error('Unknown Error') as unknown as ValidationError,
      ]);
      // When
      await expect(
        controller.handleError(falsyError),
        // Then
      ).rejects.toThrow(RieBrokerProxyMissingVariableException);
      expect(validateDtoMock).toHaveBeenCalledTimes(1);
    });

    it('should fail to return HTTP message from broker message', async () => {
      // Given
      const successError = {
        code: 1000,
        name: 'ErrorName',
        reason: 'Nice try M. Bond !',
      };

      validateDtoMock.mockResolvedValueOnce([
        /* No error */
      ]);
      // When
      await expect(
        controller.handleError(successError),
        // Then
      ).rejects.toThrow(RieBrokerProxyCsmrException);
      expect(validateDtoMock).toHaveBeenCalledTimes(1);
    });
  });
});
