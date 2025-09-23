import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@fc/config';
import { FcException } from '@fc/exceptions/exceptions';
import { LoggerService } from '@fc/logger';
import { LoggerService as LoggerLegacyService } from '@fc/logger-legacy';

import { getLoggerMock } from '@mocks/logger';

import { TrackedEventContextInterface } from '../interfaces';
import { CoreTrackingService } from './core-tracking.service';
import { TrackingService } from './tracking.service';

describe('TrackingService', () => {
  let service: TrackingService;

  const appTrackingMock = {
    buildLog: jest.fn(),
  };

  const loggerMock = getLoggerMock();

  const loggerLegacyMock = {
    businessEvent: jest.fn(),
  };

  class ExceptionClass extends FcException {}

  const eventMapMock = {
    FOO: {
      category: 'someCategory',
      event: 'FOO',
    },
    BAR: {
      category: 'someCategory',
      event: 'BAR',
      exceptions: [ExceptionClass],
    },
  };

  const configMock = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrackingService,
        ConfigService,
        LoggerService,
        LoggerLegacyService,
        CoreTrackingService,
      ],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .overrideProvider(LoggerLegacyService)
      .useValue(loggerLegacyMock)
      .overrideProvider(ConfigService)
      .useValue(configMock)
      .overrideProvider(CoreTrackingService)
      .useValue(appTrackingMock)
      .compile();

    service = module.get<TrackingService>(TrackingService);

    configMock.get.mockReturnValue({
      eventsMap: eventMapMock,
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit()', () => {
    it('should set TrackedEventsMap property from config', () => {
      // When
      service.onModuleInit();
      // Then
      expect(service.TrackedEventsMap).toBe(eventMapMock);
    });
  });

  describe('track', () => {
    it('should call `appTrackingService.buildLog()` & logger.businessEvent methods', async () => {
      // Given
      const EventMock = {
        category: 'EventMockCategory',
        event: 'eventMockEvent',
      };

      const context = Symbol(
        'context',
      ) as unknown as TrackedEventContextInterface;
      // When
      await service.track(EventMock, context);
      // Then
      expect(appTrackingMock.buildLog).toHaveBeenCalledTimes(1);
      expect(appTrackingMock.buildLog).toHaveBeenCalledWith(EventMock, context);
      expect(loggerLegacyMock.businessEvent).toHaveBeenCalledTimes(1);
    });
  });
});
