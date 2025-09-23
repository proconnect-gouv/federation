import { Test, TestingModule } from '@nestjs/testing';

import { LoggerService } from '@fc/logger';
import { LoggerService as LoggerLegacyService } from '@fc/logger-legacy';
import { TrackedEvent } from '@fc/tracking/enums';

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

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrackingService,
        LoggerService,
        LoggerLegacyService,
        CoreTrackingService,
      ],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .overrideProvider(LoggerLegacyService)
      .useValue(loggerLegacyMock)
      .overrideProvider(CoreTrackingService)
      .useValue(appTrackingMock)
      .compile();

    service = module.get<TrackingService>(TrackingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('track', () => {
    it('should call `appTrackingService.buildLog()` & logger.businessEvent methods', async () => {
      const context = Symbol(
        'context',
      ) as unknown as TrackedEventContextInterface;
      // When
      await service.track(TrackedEvent.FC_AUTHORIZE_INITIATED, context);
      // Then
      expect(appTrackingMock.buildLog).toHaveBeenCalledTimes(1);
      expect(appTrackingMock.buildLog).toHaveBeenCalledWith(
        TrackedEvent.FC_AUTHORIZE_INITIATED,
        context,
      );
      expect(loggerLegacyMock.businessEvent).toHaveBeenCalledTimes(1);
    });
  });
});
