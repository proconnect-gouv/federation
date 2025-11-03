import { LoggerService } from '@fc/logger';

export function getLoggerMock(): jest.Mocked<LoggerService> {
  return {
    fatal: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
    track: jest.fn(),
  } as unknown as jest.Mocked<LoggerService>;
}
