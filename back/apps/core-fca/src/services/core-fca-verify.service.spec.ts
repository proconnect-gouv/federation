import { Request } from 'express';

import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@fc/config';
import { CORE_VERIFY_SERVICE, CoreVerifyService } from '@fc/core';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { SessionService } from '@fc/session';
import { TrackingService } from '@fc/tracking';

import { getSessionServiceMock } from '@mocks/session';

import { CoreFcaVerifyService } from './core-fca-verify.service';

describe('CoreFcaVerifyService', () => {
  let service: CoreFcaVerifyService;

  const coreVerifyServiceMock = {
    verify: jest.fn(),
    trackVerified: jest.fn(),
  };

  const sessionServiceMock = getSessionServiceMock();

  const trackingServiceMock: TrackingService = {
    track: jest.fn(),
    TrackedEventsMap: {
      SP_DISABLED_SSO: {},
    },
  } as unknown as TrackingService;

  const configServiceMock = {
    get: jest.fn(),
  };

  const interactionIdMock = 'interactionIdMockValue';

  const req = {
    fc: {
      interactionId: interactionIdMock,
    },
    query: {
      firstQueryParam: 'first',
      secondQueryParam: 'second',
    },
  } as unknown as Request;

  const params = {
    urlPrefix: 'urlPrefixValue',
    interactionId: 'interactionId',
    sessionOidc: sessionServiceMock,
  };

  const identityProviderAdapterMock = {
    getById: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        CoreFcaVerifyService,
        {
          provide: CORE_VERIFY_SERVICE,
          useClass: CoreVerifyService,
        },
        TrackingService,
        CoreVerifyService,
        ConfigService,
        SessionService,
        IdentityProviderAdapterMongoService,
      ],
    })
      .overrideProvider(SessionService)
      .useValue(sessionServiceMock)
      .overrideProvider(CORE_VERIFY_SERVICE)
      .useValue(coreVerifyServiceMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(TrackingService)
      .useValue(trackingServiceMock)
      .overrideProvider(IdentityProviderAdapterMongoService)
      .useValue(identityProviderAdapterMock)
      .compile();

    sessionServiceMock.get.mockResolvedValue(sessionServiceMock);

    service = app.get<CoreFcaVerifyService>(CoreFcaVerifyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleVerify()', () => {
    beforeEach(() => {
      service['trackVerified'] = jest.fn();
    });

    it('should call core.verify()', async () => {
      // When
      await service['handleVerifyIdentity'](req, params);
      // Then
      expect(coreVerifyServiceMock.verify).toHaveBeenCalledTimes(1);
      expect(coreVerifyServiceMock.verify).toHaveBeenCalledWith(
        sessionServiceMock,
        { req },
      );
    });

    it('should call trackVerified()', async () => {
      // When
      await service['handleVerifyIdentity'](req, params);
      // Then
      expect(coreVerifyServiceMock.trackVerified).toHaveBeenCalledTimes(1);
      expect(coreVerifyServiceMock.trackVerified).toHaveBeenCalledWith(req);
    });

    it('should return url result', async () => {
      // Given
      const expected = 'urlPrefixValue/login';
      // When
      const result = await service['handleVerifyIdentity'](req, params);
      // Then
      expect(result).toBe(expected);
    });
  });

  describe('handleErrorLoginRequired()', () => {
    it("should build a redirect url containing a 'login_required' error and its description", () => {
      // When
      const result = service['handleErrorLoginRequired'](
        'https://foo.com/callback',
      );

      // Then
      expect(result).toBe(
        'https://foo.com/callback?error=login_required&error_description=End-User+authentication+is+required',
      );
    });
  });
});
