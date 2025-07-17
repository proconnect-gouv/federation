import { ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@fc/config';
import { LoggerService } from '@fc/logger';
import { LoggerService as LoggerLegacyService } from '@fc/logger-legacy';

import { getLoggerMock } from '@mocks/logger';

import { Track } from '../decorators';
import { CoreTrackingService, TrackingService } from '../services';
import { TrackingInterceptor } from './tracking.interceptor';

describe('TrackingInterceptor', () => {
  let interceptor: TrackingInterceptor;
  const TrackMock = jest.mocked(Track);

  const trackingMock = {
    track: jest.fn(),
    TrackedEventsMap: {},
  };

  const appTrackingMock = {
    buildLog: jest.fn(),
  };

  const httpContextMock = {
    getRequest: jest.fn(),
  };

  const contextMock = {
    switchToHttp: () => httpContextMock,
    getHandler: jest.fn(),
  } as unknown as ExecutionContext;

  const reqMock = {
    ip: '123.123.123.123',
    fc: { interactionId: '42' },
    route: {
      path: '/mock/path',
    },
  };

  const nextMock = {
    handle: jest.fn(),
    pipe: jest.fn(),
  };

  const configServiceMock = {
    get: jest.fn(),
  };
  const urlPrefixMock = '/url/prefix';

  const configMock = {
    urlPrefix: urlPrefixMock,
  };

  const loggerMock = getLoggerMock();
  const loggerLegacyMock = {
    businessEvent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrackingInterceptor,
        TrackingService,
        ConfigService,
        LoggerService,
        LoggerLegacyService,
        CoreTrackingService,
      ],
    })
      .overrideProvider(TrackingService)
      .useValue(trackingMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .overrideProvider(LoggerLegacyService)
      .useValue(loggerLegacyMock)
      .overrideProvider(CoreTrackingService)
      .useValue(appTrackingMock)
      .compile();

    interceptor = module.get<TrackingInterceptor>(TrackingInterceptor);

    jest.resetAllMocks();
    nextMock.handle.mockReturnThis();
    httpContextMock.getRequest.mockReturnValue(reqMock);
    configServiceMock.get.mockReturnValueOnce(configMock);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    it('should not call log until next', () => {
      // Given
      TrackMock.get = jest.fn().mockReturnValueOnce('');
      // When
      interceptor.intercept(contextMock, nextMock);
      // Then
      expect(trackingMock.track).toHaveBeenCalledTimes(0);
    });

    it('should add a tap operator to the observable pipeline', () => {
      // Given
      const eventName = 'TestEvent';
      const event = { name: eventName };
      TrackMock.get = jest.fn().mockReturnValueOnce(eventName);
      trackingMock.TrackedEventsMap = { [eventName]: event };
      const observableMock = {
        pipe: jest.fn(),
      };
      nextMock.handle.mockReturnValue(observableMock);
      // When
      interceptor.intercept(contextMock, nextMock);
      // Then
      expect(observableMock.pipe).toHaveBeenCalledTimes(1);
    });
  });
});
