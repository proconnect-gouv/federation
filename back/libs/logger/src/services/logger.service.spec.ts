import pino, { Logger } from 'pino';

import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@fc/config';

import { getConfigMock } from '@mocks/config';
import { getLoggerMock } from '@mocks/logger';

import { LogLevels } from '../enums';
import { PLUGIN_SERVICES } from '../tokens';
import { LoggerService } from './logger.service';

jest.mock('pino');

describe('LoggerService', () => {
  let service: LoggerService;

  const configMock = {
    threshold: 'debug',
  };
  const configServiceMock = getConfigMock();
  const loggerMock = getLoggerMock();

  const pluginMock1 = {
    getContext: jest.fn(),
  };

  const pluginMock2 = {
    getContext: jest.fn(),
  };

  const pluginsMocks = [pluginMock1, pluginMock2];

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();

    configServiceMock.get.mockReturnValue(configMock);
    jest.mocked(pino).mockReturnValue(loggerMock as unknown as Logger<string>);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggerService,
        ConfigService,
        {
          provide: PLUGIN_SERVICES,
          useValue: pluginsMocks,
        },
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .compile();

    service = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('configure', () => {
    /**
     * 🚨 Due to the use of a constructor, we need to clear counter to properly test the function.
     * Please exerts utmost caution while updating. 🚨
     */
    beforeEach(() => {
      jest.clearAllMocks();

      service['overloadConsole'] = jest.fn();
    });

    it('should retrieve the logger config', () => {
      // When
      service['configure']();

      // Then
      expect(configServiceMock.get).toHaveBeenCalledTimes(1);
      expect(configServiceMock.get).toHaveBeenCalledWith('Logger');
    });

    it('should overload the console', () => {
      // When
      service['configure']();

      // Then
      expect(service['overloadConsole']).toHaveBeenCalledTimes(1);
      expect(service['overloadConsole']).toHaveBeenCalledWith();
    });

    it('should log a notice that the console logger is overloaded', () => {
      // When
      service['configure']();

      // Then
      expect(loggerMock.info).toHaveBeenCalledTimes(1);
      expect(loggerMock.info).toHaveBeenCalledWith(
        'Logger is ready and native console is now overloaded.',
      );
    });
  });

  describe('debug', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      service['logWithContext'] = jest.fn();
    });

    it('should call the pino logger with the correct level, object and message with arguments', () => {
      // Given
      const level = LogLevels.DEBUG;
      const message = 'test message';
      const obj = { test: 'test' };
      const args = ['arg1', 'arg2'];

      // When
      service[level](obj, message, ...args);

      // Then
      expect(service['logWithContext']).toHaveBeenCalledTimes(1);
      expect(service['logWithContext']).toHaveBeenCalledWith(
        level,
        obj,
        message,
        ...args,
      );
    });
  });

  describe('logWithContext', () => {
    const contextMock = {
      foo: 'bar',
    };

    beforeEach(() => {
      jest.clearAllMocks();

      service['getContextFromPlugins'] = jest.fn().mockReturnValue(contextMock);
    });

    it('should call the pino logger with the correct level and arguments when first argument is the message', () => {
      // Given
      const level = LogLevels.DEBUG;
      const message = 'test message';
      const args = ['arg1', 'arg2'];

      // When
      service['logWithContext'](level, message, args[0], args[1]);

      // Then
      expect(loggerMock[level]).toHaveBeenCalledTimes(1);
      expect(loggerMock[level]).toHaveBeenCalledWith(
        contextMock,
        message,
        ...args,
      );
    });

    it('should call the pino logger with the correct level and arguments when first argument is an object', () => {
      // Given
      const level = LogLevels.DEBUG;
      const message = 'test message';
      const obj = { test: 'test' };
      const args = ['arg1', 'arg2'];
      const expectedMessage = {
        ...obj,
        ...contextMock,
      };

      // When
      service['logWithContext'](level, obj, message, args[0], args[1]);

      // Then
      expect(loggerMock[level]).toHaveBeenCalledTimes(1);
      expect(loggerMock[level]).toHaveBeenCalledWith(
        expectedMessage,
        message,
        ...args,
      );
    });

    it('should call the pino logger with the correct level and arguments when first argument is anything other than a string', () => {
      // Given
      const level = LogLevels.DEBUG;
      const message = 'test message';
      const obj = 123;
      const args = ['arg1', 'arg2'];

      // When
      service['logWithContext'](level, obj, message, args[0], args[1]);

      // Then
      expect(loggerMock[level]).toHaveBeenCalledTimes(1);
      expect(loggerMock[level]).toHaveBeenCalledWith(
        contextMock,
        message,
        ...args,
      );
    });

    it('should call getContextFromPlugins with the call stack', () => {
      // When
      service['logWithContext'](LogLevels.DEBUG, 'test message');

      // Then
      expect(
        service['getContextFromPlugins'],
      ).toHaveBeenCalledExactlyOnceWith();
    });

    it('should call getContextFromPlugins without the call stack', () => {
      // Given
      configServiceMock.get.mockReturnValueOnce({ threshold: LogLevels.INFO });

      // When
      service['logWithContext'](LogLevels.DEBUG, 'test message');

      // Then
      expect(service['getContextFromPlugins']).toHaveBeenCalledExactlyOnceWith(
        undefined,
      );
    });
  });

  describe('getContextFromPlugins', () => {
    it('should call the getContext method of each plugin service', () => {
      // When
      service['getContextFromPlugins']();

      // Then
      expect(pluginMock1.getContext).toHaveBeenCalledExactlyOnceWith();
      expect(pluginMock2.getContext).toHaveBeenCalledExactlyOnceWith();
    });

    it('should return the context from the plugins', () => {
      // Given
      const plugin1Context = {
        foo: 'bar',
      };
      const plugin2Context = {
        bar: 'foo',
      };
      pluginMock1.getContext.mockReturnValueOnce(plugin1Context);
      pluginMock2.getContext.mockReturnValueOnce(plugin2Context);

      // When
      const result = service['getContextFromPlugins']();
      // Then
      expect(result).toEqual({
        ...plugin1Context,
        ...plugin2Context,
      });
    });
  });

  describe('overloadConsole', () => {
    it('should overload the console with the logger to the correct level', () => {
      // When
      service['overloadConsole']();

      // Then
      expect(console.log.toString()).toEqual(
        service[LogLevels.INFO].bind(service).toString(),
      );
    });
  });
});
