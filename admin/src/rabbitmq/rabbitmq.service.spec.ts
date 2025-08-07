import { ConfigService } from 'nestjs-config';
import * as rxjs from 'rxjs/operators';
import { Test, TestingModule } from '@nestjs/testing';
import { RabbitmqService } from './rabbitmq.service';
import { RabbitmqFailureException } from './rabbitmq.failure.exception';

describe('RabbitmqService', () => {
  let service: RabbitmqService;

  const configMock = {
    get: jest.fn(),
  };

  const messageMock = {
    pipe: jest.fn(),
  };

  const pipeMock = {
    subscribe: jest.fn(),
  };

  const brokerResponseMock = 'brokerResponseMock';

  const brokerMock = {
    send: jest.fn(),
    connect: jest.fn(),
    close: jest.fn(),
  };

  const timeoutReturnMock = Symbol('timeoutReturnMockValue') as any;
  const rxjsTimeoutMock = jest.spyOn(rxjs, 'timeout');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        RabbitmqService,
        {
          provide: 'cryptography-broker',
          useValue: brokerMock,
        },
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(configMock)
      .compile();

    service = module.get<RabbitmqService>(RabbitmqService);

    jest.resetAllMocks();

    brokerMock.send.mockReturnValue(messageMock);
    messageMock.pipe.mockReturnValue(pipeMock);
    pipeMock.subscribe.mockImplementation(res => res(brokerResponseMock));
    configMock.get.mockReturnValue({
      payloadEncoding: 'base64',
      requestTimeout: 200,
      useHsm: true,
    });
    rxjsTimeoutMock.mockReturnValue(timeoutReturnMock);
  });

  describe('onModuleInit', () => {
    it('should connect to broker', async () => {
      // When
      await service.onModuleInit();
      // Then
      expect(brokerMock.connect).toHaveBeenCalledTimes(1);
    });

    it('should not connect to broker if instance is not CL', async () => {
      // given
      configMock.get.mockReturnValue({ useHsm: false });

      // When
      await service.onModuleInit();
      // Then
      expect(brokerMock.connect).not.toHaveBeenCalled();
    });
  });

  describe('onModuleClose', () => {
    it('should close connection to broker', () => {
      // When
      service.onModuleDestroy();
      // Then
      expect(brokerMock.close).toHaveBeenCalledTimes(1);
    });

    it('should not close connection to broker if instance is not CL', () => {
      // given
      configMock.get.mockReturnValue({ useHsm: false });

      // When
      service.onModuleDestroy();
      // Then
      expect(brokerMock.close).not.toHaveBeenCalled();
    });
  });

  describe('publish', () => {
    it('should return a promise', () => {
      // Given
      const command = 'foo';
      const payload = {};
      // When
      const result = service.publish(command, payload);
      // Then
      expect(result).toBeInstanceOf(Promise);
    });

    it('should call send with command', async () => {
      // Given
      const command = 'foo';
      const payload = {};
      // When
      await service.publish(command, payload);
      // Then
      expect(brokerMock.send).toHaveBeenCalledTimes(1);
      expect(brokerMock.send).toHaveBeenCalledWith(command, payload);
    });

    it('should call pipe', async () => {
      // Given
      const command = 'foo';
      const payload = {};
      // When
      await service.publish(command, payload);
      // Then
      expect(messageMock.pipe).toHaveBeenCalledTimes(1);
      expect(messageMock.pipe).toHaveBeenCalledWith(timeoutReturnMock);
    });

    it('should call subscribe', async () => {
      // Given
      const command = 'foo';
      const payload = {};
      // When
      await service.publish(command, payload);
      // Then
      expect(pipeMock.subscribe).toHaveBeenCalledTimes(1);
    });

    it('should call success (and only) if promise resolves', () => {
      // Given
      const command = 'foo';
      const payload = {};
      // tslint:disable-next-line: no-string-literal
      service['success'] = jest.fn();
      pipeMock.subscribe.mockImplementationOnce(res => res());
      // When
      service.publish(command, payload);
      // Then
      // tslint:disable-next-line: no-string-literal
      expect(service['success']).toHaveBeenCalledTimes(1);
    });

    it('should call failure if promise rejects', () => {
      // Given
      const command = 'foo';
      const payload = {};
      pipeMock.subscribe.mockImplementationOnce((res, rej) => rej());
      // tslint:disable-next-line: no-string-literal
      service['failure'] = jest.fn();
      // When
      service.publish(command, payload);
      // Then
      // tslint:disable-next-line: no-string-literal
      expect(service['failure']).toHaveBeenCalledTimes(1);
    });
  });

  describe('success', () => {
    it('should call resolve and not failure', () => {
      // Given
      const resolve = jest.fn();
      const reject = jest.fn();
      const responseMock = 'responseMockValue';
      // When
      // tslint:disable-next-line: no-string-literal
      service['success'](resolve, reject, responseMock);
      // Then
      expect(resolve).toHaveBeenCalledTimes(1);
      expect(resolve).toHaveBeenCalledWith(responseMock);
      expect(reject).toHaveBeenCalledTimes(0);
    });

    it('should call failure', () => {
      // Given
      const resolve = jest.fn();
      const reject = jest.fn();
      const responseMock = 'ERROR';
      // tslint:disable-next-line: no-string-literal
      service['failure'] = jest.fn();
      // When
      // tslint:disable-next-line: no-string-literal
      service['success'](resolve, reject, responseMock);
      // Then
      // tslint:disable-next-line: no-string-literal
      expect(service['failure']).toHaveBeenCalledTimes(1);
      // tslint:disable-next-line: no-string-literal
      expect(service['failure']).toHaveBeenCalledWith(
        reject,
        expect.any(Error),
      );
    });
  });

  describe('failure', () => {
    it('should call reject', () => {
      // Given
      const reject = jest.fn();
      const errorMock = new Error();
      // When
      // tslint:disable-next-line: no-string-literal
      service['failure'](reject, errorMock);
      // Then
      expect(reject).toHaveBeenCalledTimes(1);
      expect(reject).toHaveBeenCalledWith(expect.any(RabbitmqFailureException));
    });
  });
});
