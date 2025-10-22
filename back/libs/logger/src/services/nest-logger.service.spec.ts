import { Test, TestingModule } from '@nestjs/testing';

import { getLoggerMock } from '@mocks/logger';

import { LoggerService } from './logger.service';
import { NestLoggerService } from './nest-logger.service';

describe('NestLoggerService', () => {
  let service: NestLoggerService;

  const loggerMock = getLoggerMock();

  const message = 'test';
  const context = 'context';
  const optionalParams = ['params'];

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [NestLoggerService, LoggerService],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .compile();

    service = module.get<NestLoggerService>(NestLoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('log', () => {
    it('should call logger.info', () => {
      // When
      service.log(message, context);

      // Then
      expect(loggerMock.info).toHaveBeenCalledWith(
        { optionalParams: [context] },
        message,
      );
    });

    it('should call logger.info with optional params', () => {
      // When
      service.log(message, ...optionalParams, context);

      // Then
      expect(loggerMock.info).toHaveBeenCalledWith(
        { optionalParams: [...optionalParams, context] },
        message,
      );
    });
  });

  describe('fatal', () => {
    it('should call logger.alert', () => {
      // When
      service.fatal(message, context);

      // Then
      expect(loggerMock.fatal).toHaveBeenCalledWith(
        { optionalParams: [context] },
        message,
      );
    });

    it('should call logger.alert with optional params', () => {
      // When
      service.fatal(message, ...optionalParams, context);

      // Then
      expect(loggerMock.fatal).toHaveBeenCalledWith(
        { optionalParams: [...optionalParams, context] },
        message,
      );
    });
  });

  describe('debug', () => {
    it('should call logger.debug', () => {
      // When
      service.debug(message, context);

      // Then
      expect(loggerMock.debug).toHaveBeenCalledWith(
        { optionalParams: [context] },
        message,
      );
    });

    it('should call logger.debug with optional params', () => {
      // When
      service.debug(message, ...optionalParams, context);

      // Then
      expect(loggerMock.debug).toHaveBeenCalledWith(
        { optionalParams: [...optionalParams, context] },
        message,
      );
    });
  });
});
