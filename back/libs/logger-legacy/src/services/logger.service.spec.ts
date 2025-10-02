import pino, { Logger } from 'pino';
import { v4 as uuidV4 } from 'uuid';

import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@fc/config';

import { LoggerService } from './logger.service';

jest.mock('pino');
jest.mock('uuid');

describe('LoggerService', () => {
  let service: LoggerService;
  let configServiceMock: jest.Mocked<ConfigService>;
  let loggerMock: jest.Mocked<Logger>;
  let streamMock: { reopen: jest.Mock };

  const pathMock = '/path/to/logs';
  const configMock = { path: pathMock };
  const uuidMock = 'mocked-uuid-value';

  beforeEach(async () => {
    jest.clearAllMocks();

    // Mock UUID
    (uuidV4 as jest.Mock).mockReturnValue(uuidMock);

    // Mock stream
    streamMock = { reopen: jest.fn() };
    jest.mocked(pino.destination).mockReturnValue(streamMock as any);

    // Mock logger
    loggerMock = { info: jest.fn() } as unknown as jest.Mocked<Logger<string>>;
    jest.mocked(pino).mockReturnValue(loggerMock as unknown as Logger<string>);

    // Mock config service
    configServiceMock = {
      get: jest.fn().mockReturnValue(configMock),
    } as unknown as jest.Mocked<ConfigService>;

    // Mock process.on
    jest.spyOn(process, 'on').mockImplementation((_event, _callback) => {
      return process;
    });

    // Mock console.warn
    jest.spyOn(console, 'warn').mockImplementation();

    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggerService, ConfigService],
    })
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .compile();

    service = module.get<LoggerService>(LoggerService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('constructor', () => {
    it('should get the logger configuration from ConfigService', () => {
      // Then
      expect(configServiceMock.get).toHaveBeenCalledTimes(1);
      expect(configServiceMock.get).toHaveBeenCalledWith('LoggerLegacy');
    });

    it('should create a pino destination with the configured path', () => {
      // Then
      expect(pino.destination).toHaveBeenCalledTimes(1);
      expect(pino.destination).toHaveBeenCalledWith(pathMock);
    });

    it('should initialize pino with the correct options', () => {
      // Then
      expect(pino).toHaveBeenCalledTimes(1);
      expect(pino).toHaveBeenCalledWith(
        {
          formatters: {
            level: expect.any(Function),
          },
          level: 'info',
        },
        streamMock,
      );
    });

    it('should format the level correctly', () => {
      // Given
      const formatter = jest.mocked(pino).mock.calls[0][0].formatters.level;
      const label = 'info';
      const number = 30;

      // When
      const result = formatter(label, number);

      // Then
      expect(result).toEqual({ level: label });
    });

    it('should register a handler for SIGUSR2 signal', () => {
      // Then
      expect(process.on).toHaveBeenCalledTimes(1);
      expect(process.on).toHaveBeenCalledWith('SIGUSR2', expect.any(Function));
    });
  });

  describe('SIGUSR2 handler', () => {
    it('should reopen the stream when SIGUSR2 signal is received', () => {
      // Given
      const handler = jest.mocked(process.on).mock.calls[0][1] as Function;

      // When
      handler();

      // Then
      expect(console.warn).toHaveBeenCalledTimes(2);
      expect(console.warn).toHaveBeenNthCalledWith(
        1,
        `SIGUSR2: Reveived, reopening at ${pathMock}`,
      );
      expect(console.warn).toHaveBeenNthCalledWith(2, 'SIGUSR2: done');
      expect(streamMock.reopen).toHaveBeenCalledTimes(1);
    });
  });

  describe('businessEvent', () => {
    it('should log the business event with a UUID', () => {
      // Given
      const businessEventMock = {
        category: 'test-category',
        event: 'test-event',
        ip: '123.123.123.123',
        source: {
          address: '123.123.123.123',
          port: '443',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          original_addresses: '123.123.123.123, 124.124.124.124',
        },
      };

      // When
      service.businessEvent(businessEventMock);

      // Then
      expect(loggerMock.info).toHaveBeenCalledTimes(1);
      expect(loggerMock.info).toHaveBeenCalledWith({
        ...businessEventMock,
        logId: uuidMock,
      });
    });
  });
});
