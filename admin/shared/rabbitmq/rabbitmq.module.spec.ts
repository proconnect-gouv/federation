import { ConfigService } from 'nestjs-config';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { RabbitmqModule } from './rabbitmq.module';

describe('RabbitmqModule', () => {
  const configServiceMock = {
    get: jest.fn(),
  };

  const configServiceReturnValue = Symbol('configServiceReturnValue');

  beforeEach(() => {
    jest.resetAllMocks();
    configServiceMock.get.mockReturnValue(configServiceReturnValue);
  });

  describe('registerFor', () => {
    it('should return a module declaration', () => {
      // Given
      const moduleNameMock = 'Foobar';
      // When
      const result = RabbitmqModule.registerFor(moduleNameMock);
      // Then
      expect(result).toBeInstanceOf(Object);
      expect(result).toHaveProperty('module');
      expect(result).toHaveProperty('providers');
      expect(result).toHaveProperty('exports');
    });
    it('should return a module with a provider for "<moduleName>-broker"', () => {
      // Given
      const moduleNameMock = 'Foobar';
      const module = RabbitmqModule.registerFor(moduleNameMock);
      // When
      const [result] = module.providers as any;
      // Then
      expect(result).toHaveProperty('provide');
      expect(result.provide).toBe('Foobar-broker');
    });
    it('should return a module with a provider having a useFactory method', () => {
      // Given
      const moduleNameMock = 'Foobar';
      const module = RabbitmqModule.registerFor(moduleNameMock);
      // When
      const [result] = module.providers as any;
      // Then
      expect(result).toHaveProperty('useFactory');
      expect(result.useFactory).toBeInstanceOf(Function);
    });
  });

  describe('factory', () => {
    it('should call ConfigService', () => {
      // Given
      const clientNameMock = 'Foobar-broker';
      // When
      // tslint:disable-next-line: no-string-literal
      RabbitmqModule['factory'](
        clientNameMock,
        (configServiceMock as unknown) as ConfigService,
      );
      // Then
      expect(configServiceMock.get).toHaveBeenCalledTimes(1);
      expect(configServiceMock.get).toHaveBeenCalledWith('Foobar-broker');
    });
    it('should call ClientProxyFactory.Create', () => {
      // Given
      const clientNameMock = 'Foobar-broker';
      jest
        .spyOn(ClientProxyFactory, 'create')
        .mockReturnValue({} as ClientProxy);
      // When
      // tslint:disable-next-line: no-string-literal
      RabbitmqModule['factory'](
        clientNameMock,
        (configServiceMock as unknown) as ConfigService,
      );
      // Then
      expect(ClientProxyFactory.create).toHaveBeenCalledTimes(1);
      expect(ClientProxyFactory.create).toHaveBeenCalledWith({
        transport: Transport.RMQ,
        options: configServiceReturnValue,
      });
    });
  });
});
