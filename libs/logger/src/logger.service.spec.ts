import { ConfigService } from '@fc/config';
import { LoggerService } from './logger.service';
import { LogLevelNames } from './enum';

describe('LoggerService', () => {
  // Generate configs for all levels and dev mode
  const configs: any = { dev: {}, notDev: {} };
  Object.values(LogLevelNames).forEach(level => {
    configs['dev'][level] = {
      path: '/dev/null',
      isDevelopment: true,
      level: level,
    };

    configs['notDev'][level] = {
      path: '/dev/null',
      isDevelopment: false,
      level: level,
    };
  });

  const internalLoggerMock: any = jest.fn();
  const externalLoggerMock: any = {
    info: jest.fn(),
  };

  let configMock = {};
  const configServiceMock = ({
    get: () => configMock,
  } as unknown) as ConfigService;

  const getConfiguredMockedService = config => {
    configMock = config;
    const service = new LoggerService(configServiceMock);

    externalLoggerMock.level = config.level;

    service['internalLogger'] = internalLoggerMock;
    service['externalLogger'] = externalLoggerMock;

    return service;
  };

  beforeEach(async () => {
    jest.resetAllMocks();
  });

  describe('logger.log()', () => {
    it('Should call only internalLogger when level: log and dev: true', () => {
      // Given
      const service = getConfiguredMockedService(configs.dev.log);
      // When
      service.log('log');
      // Then
      expect(service['internalLogger']).toHaveBeenCalledTimes(1);
      expect(service['externalLogger'].info).toHaveBeenCalledTimes(0);
    });
    it('Should not call any logger when level: log and dev: false', () => {
      // Given
      const service = getConfiguredMockedService(configs.notDev.log);
      // When
      service.log('log');
      // Then
      expect(service['internalLogger']).toHaveBeenCalledTimes(0);
      expect(service['externalLogger'].info).toHaveBeenCalledTimes(0);
    });
  });

  describe('logger.trace()', () => {
    it('Should call only internalLogger when level: trace and dev: true', () => {
      // Given
      const service = getConfiguredMockedService(configs.dev.trace);
      // When
      service.trace('trace');
      // Then
      expect(service['internalLogger']).toHaveBeenCalledTimes(1);
      expect(service['externalLogger'].info).toHaveBeenCalledTimes(0);
    });

    it('Should not call any logger when level: trace and dev: false', () => {
      // Given
      const service = getConfiguredMockedService(configs.notDev.trace);
      // When
      service.trace('trace');
      // Then
      expect(service['internalLogger']).toHaveBeenCalledTimes(0);
      expect(service['externalLogger'].info).toHaveBeenCalledTimes(0);
    });
  });

  describe('logger.verbose()', () => {
    it('Should call only internalLogger when level: verbose and dev: true', () => {
      // Given
      const service = getConfiguredMockedService(configs.dev.verbose);
      // When
      service.verbose('verbose');
      // Then
      expect(service['internalLogger']).toHaveBeenCalledTimes(1);
      expect(service['externalLogger'].info).toHaveBeenCalledTimes(0);
    });

    it('Should call only internalLogger when level: verbose and dev: false', () => {
      // Given
      const service = getConfiguredMockedService(configs.notDev.verbose);
      // When
      service.verbose('verbose');
      // Then
      expect(service['internalLogger']).toHaveBeenCalledTimes(1);
      expect(service['externalLogger'].info).toHaveBeenCalledTimes(0);
    });
  });

  describe('logger.debug()', () => {
    it('Should call only internalLogger when level: debug and dev: true', () => {
      // Given
      const service = getConfiguredMockedService(configs.dev.debug);
      // When
      service.debug('debug');
      // Then
      expect(service['internalLogger']).toHaveBeenCalledTimes(1);
      expect(service['externalLogger'].info).toHaveBeenCalledTimes(0);
    });

    it('Should call only internalLogger when level: debug and dev: false', () => {
      // Given
      const service = getConfiguredMockedService(configs.notDev.debug);
      // When
      service.debug('debug');
      // Then
      expect(service['internalLogger']).toHaveBeenCalledTimes(1);
      expect(service['externalLogger'].info).toHaveBeenCalledTimes(0);
    });
  });

  describe('logger.info()', () => {
    it('Should call only internalLogger when level: info and dev: true', () => {
      // Given
      const service = getConfiguredMockedService(configs.dev.info);
      // When
      service.info('info');
      // Then
      expect(service['internalLogger']).toHaveBeenCalledTimes(1);
      expect(service['externalLogger'].info).toHaveBeenCalledTimes(0);
    });
    it('Should call only internalLogger when level: info and dev: false', () => {
      // Given
      const service = getConfiguredMockedService(configs.notDev.info);
      // When
      service.info('info');
      // Then
      expect(service['internalLogger']).toHaveBeenCalledTimes(1);
      expect(service['externalLogger'].info).toHaveBeenCalledTimes(0);
    });
  });

  describe('logger.warn()', () => {
    it('Should call only internalLogger when level: warn and dev: true', () => {
      // Given
      const service = getConfiguredMockedService(configs.dev.warn);
      // When
      service.warn('warn');
      // Then
      expect(service['internalLogger']).toHaveBeenCalledTimes(1);
      expect(service['externalLogger'].info).toHaveBeenCalledTimes(0);
    });
    it('Should call only internalLogger when level: warn and dev: false', () => {
      // Given
      const service = getConfiguredMockedService(configs.notDev.warn);
      // When
      service.warn('warn');
      // Then
      expect(service['internalLogger']).toHaveBeenCalledTimes(1);
      expect(service['externalLogger'].info).toHaveBeenCalledTimes(0);
    });
  });

  describe('logger.error()', () => {
    it('Should call only internalLogger when level: error and dev: true', () => {
      // Given
      const service = getConfiguredMockedService(configs.dev.error);
      // When
      service.error('error');
      // Then
      expect(service['internalLogger']).toHaveBeenCalledTimes(1);
      expect(service['externalLogger'].info).toHaveBeenCalledTimes(0);
    });

    it('Should call only internalLogger when level: error and dev: false', () => {
      // Given
      const service = getConfiguredMockedService(configs.notDev.error);
      // When
      service.error('error');
      // Then
      expect(service['internalLogger']).toHaveBeenCalledTimes(1);
      expect(service['externalLogger'].info).toHaveBeenCalledTimes(0);
    });
  });

  describe('logger.fatal()', () => {
    it('Should call only internalLogger when level: fatal and dev: true', () => {
      // Given
      const service = getConfiguredMockedService(configs.dev.fatal);
      // When
      service.fatal('fatal');
      // Then
      expect(service['internalLogger']).toHaveBeenCalledTimes(1);
      expect(service['externalLogger'].info).toHaveBeenCalledTimes(0);
    });

    it('Should call only internalLogger when level: fatal and dev: false', () => {
      // Given
      const service = getConfiguredMockedService(configs.notDev.fatal);
      // When
      service.fatal('fatal');
      // Then
      expect(service['internalLogger']).toHaveBeenCalledTimes(1);
      expect(service['externalLogger'].info).toHaveBeenCalledTimes(0);
    });
  });

  describe('Business logger', () => {
    it('should call both loggers when in dev mode + trace level', () => {
      // Given
      const service = getConfiguredMockedService(configs.dev.trace);
      // When
      service.businessEvent('businessEvent');
      // Then
      expect(service['internalLogger']).toHaveBeenCalledTimes(1);
      expect(service['externalLogger'].info).toHaveBeenCalledTimes(1);
    });

    it('should call only externalLogger when not in dev mode + trace level', () => {
      // Given
      const service = getConfiguredMockedService(configs.notDev.trace);
      // When
      service.businessEvent('businessEvent');
      // Then
      expect(service['internalLogger']).toHaveBeenCalledTimes(0);
      expect(service['externalLogger'].info).toHaveBeenCalledTimes(1);
    });

    it('should call only externalLogger when not in dev mode + info level', () => {
      // Given
      const service = getConfiguredMockedService(configs.notDev.info);
      // When
      service.businessEvent('businessEvent');
      // Then
      expect(service['internalLogger']).toHaveBeenCalledTimes(0);
      expect(service['externalLogger'].info).toHaveBeenCalledTimes(1);
    });

    it('should call only external logger when in dev mode + info level', () => {
      // Given
      const service = getConfiguredMockedService(configs.dev.info);
      // When
      service.businessEvent('businessEvent');
      // Then
      expect(service['internalLogger']).toHaveBeenCalledTimes(0);
      expect(service['externalLogger'].info).toHaveBeenCalledTimes(1);
    });

    it('should not call external logger when in dev mode + info level', () => {
      // Given
      const service = getConfiguredMockedService(configs.dev.debug);
      // When
      service['businessLogger'](LogLevelNames.TRACE, 'businessEvent');
      // Then
      expect(service['internalLogger']).toHaveBeenCalledTimes(0);
      expect(service['externalLogger'].info).toHaveBeenCalledTimes(0);
    });
  });

  describe('overrideNativeConsole', () => {
    it('should override native `console.log` and call service.log instead', () => {
      // Given
      const service = getConfiguredMockedService(configs.dev.log);
      service['overrideNativeConsole']();
      const messageMock = 'messageMock';
      service.log = jest.fn();
      // Hard coded value in function
      const context = 'Native Console';
      // When
      console.log(messageMock);
      // Then
      expect(service.log).toHaveBeenCalledTimes(1);
      expect(service.log).toHaveBeenCalledWith(messageMock, context);
    });
  });
});
