import { Test, TestingModule } from '@nestjs/testing';

import { LoggerService as LoggerLegacyService } from '@fc/logger-legacy';
import { SessionService } from '@fc/session';
import { trackedEventSteps } from '@fc/tracking/config/tracked-event-steps';
import { TrackedEvent } from '@fc/tracking/enums';

import { TrackingService } from './tracking.service';

describe('TrackingService', () => {
  let service: TrackingService;

  const loggerLegacyMock = {
    businessEvent: jest.fn(),
  };

  const sessionServiceMock = {
    getId: jest.fn<() => string, []>(),
    get: jest.fn(),
  } as unknown as jest.Mocked<SessionService>;

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [TrackingService, LoggerLegacyService, SessionService],
    })
      .overrideProvider(LoggerLegacyService)
      .useValue(loggerLegacyMock)
      .overrideProvider(SessionService)
      .useValue(sessionServiceMock)
      .compile();

    service = module.get<TrackingService>(TrackingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('track', () => {
    it('should call logger with a fully built business event when session data exists and sessionId is taken from SessionService', async () => {
      // Arrange
      const trackedEvent = TrackedEvent.FC_VERIFIED;
      const context = {
        req: { headers: { 'x-forwarded-for': '203.0.113.10' } },
      } as any;

      (sessionServiceMock.getId as jest.Mock).mockReturnValue('sid-123');
      (sessionServiceMock.get as jest.Mock).mockReturnValue({
        login_hint: 'login-hint',
        browsingSessionId: 'browsing-1',
        interactionId: 'inter-1',
        interactionAcr: 'acr-high',
        spId: 'sp-id-1',
        spEssentialAcr: 'eAcr',
        spName: 'Service Provider',
        spIdentity: { email: 'sp@example.com', sub: 'sp-sub-1' },
        idpId: 'idp-id-1',
        idpAcr: 'idp-acr',
        idpName: 'Identity Provider',
        idpLabel: 'Label',
        idpIdentity: { email: 'idp@example.com', sub: 'idp-sub-1' },
      });

      const expected = {
        browsingSessionId: 'browsing-1',
        event: 'FC_VERIFIED',
        idpAcr: 'idp-acr',
        idpEmail: 'idp@example.com',
        idpEmailFqdn: 'example.com',
        idpId: 'idp-id-1',
        idpLabel: 'Label',
        idpLoginHint: undefined,
        idpLoginHintFqdn: undefined,
        idpName: 'Identity Provider',
        idpSub: 'idp-sub-1',
        interactionAcr: 'acr-high',
        interactionId: 'inter-1',
        ip: '203.0.113.10',
        sessionId: 'sid-123',
        spEssentialAcr: 'eAcr',
        spId: 'sp-id-1',
        spLoginHint: undefined,
        spLoginHintFqdn: undefined,
        spName: 'Service Provider',
        spSub: 'sp-sub-1',
        step: '5.0.0',
      };

      // Act
      await service.track(trackedEvent, context);

      // Assert
      expect(loggerLegacyMock.businessEvent).toHaveBeenCalledTimes(1);
      expect(loggerLegacyMock.businessEvent).toHaveBeenCalledWith(expected);
    });

    it('should prefer context.sessionId and handle missing user session gracefully', async () => {
      // Arrange
      const trackedEvent = TrackedEvent.FC_REDIRECTED_TO_SP;
      const context = {
        sessionId: 'override-session',
        req: { headers: { 'x-forwarded-for': '198.51.100.77' } },
      } as any;

      (sessionServiceMock.getId as jest.Mock).mockReturnValue('sid-not-used');
      (sessionServiceMock.get as jest.Mock).mockReturnValue(undefined);

      const expected = {
        browsingSessionId: undefined,
        event: trackedEvent,
        idpAcr: undefined,
        idpEmail: undefined,
        idpId: undefined,
        idpLabel: undefined,
        idpName: undefined,
        idpSub: undefined,
        interactionAcr: undefined,
        interactionId: undefined,
        ip: '198.51.100.77',
        login_hint: undefined,
        sessionId: 'override-session',
        spEmail: undefined,
        spEssentialAcr: undefined,
        spId: undefined,
        spName: undefined,
        spSub: undefined,
        step: trackedEventSteps[trackedEvent],
      };

      // Act
      await service.track(trackedEvent, context);

      // Assert
      expect(loggerLegacyMock.businessEvent).toHaveBeenCalledTimes(1);
      expect(loggerLegacyMock.businessEvent).toHaveBeenCalledWith(expected);
      // Ensure getId was not used when context provides a sessionId
      expect(sessionServiceMock.getId).not.toHaveBeenCalled();
    });
  });

  describe('buildLog (private)', () => {
    it('should still be callable via any-cast and return the correct object', () => {
      // Arrange
      (sessionServiceMock.getId as jest.Mock).mockReturnValue('sid-zzz');
      (sessionServiceMock.get as jest.Mock).mockReturnValue({});
      const trackedEvent = TrackedEvent.FC_AUTHORIZE_INITIATED;
      const context = {
        req: { headers: { 'x-forwarded-for': ['10.0.0.1', '10.0.0.2'] } },
      } as any;

      // Act
      const result = (service as any).buildLog(trackedEvent, context);

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          event: trackedEvent,
          ip: ['10.0.0.1', '10.0.0.2'],
          sessionId: 'sid-zzz',
          step: trackedEventSteps[trackedEvent],
        }),
      );
    });
  });
});
