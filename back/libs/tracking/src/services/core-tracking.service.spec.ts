import { Test, TestingModule } from '@nestjs/testing';

import { overrideWithSourceIfNotNull } from '@fc/common/helpers';
import { ConfigService } from '@fc/config';
import { UserSession } from '@fc/core';
import { SessionService } from '@fc/session';

import { getSessionServiceMock } from '@mocks/session';

import { extractNetworkInfoFromHeaders } from '../helpers';
import { ICoreTrackingContext } from '../interfaces';
import { CoreTrackingService } from './core-tracking.service';

jest.mock('@fc/common/helpers');
jest.mock('../helpers/extract-network-context.helper', () => ({
  extractNetworkInfoFromHeaders: jest.fn(),
}));

describe('CoreTrackingService', () => {
  let service: CoreTrackingService;

  const sessionServiceMock = getSessionServiceMock();

  const appConfigMock = {
    urlPrefix: '/api/v2',
  };

  const configServiceMock = {
    get: () => appConfigMock,
  };

  const eventMock = {
    category: 'some category',
    event: 'name',
    route: '/',
    exceptions: [],
    intercept: false,
  };

  const ipMock = '123.123.123.123';
  const sourcePortMock = '443';
  const xForwardedForOriginalMock = '123.123.123.123, 124.124.124.124';
  const interactionIdMock = 'interactionIdValue';
  const sessionIdMock = 'sessionIdValue';
  const browsingSessionIdMock = 'browsingSessionId Mock Value';

  const contextMock = {
    req: {
      headers: {
        'x-forwarded-for': ipMock,
        'x-forwarded-source-port': sourcePortMock,
        'x-forwarded-for-original': xForwardedForOriginalMock,
      },
      fc: {
        interactionId: interactionIdMock,
      },
    },
  };

  const extractedValueMock: ICoreTrackingContext = {
    source: {
      address: ipMock,
      port: sourcePortMock,
      // logs filter and analyses need this format
      // eslint-disable-next-line @typescript-eslint/naming-convention
      original_addresses: xForwardedForOriginalMock,
    },
    sessionId: sessionIdMock,
    interactionId: interactionIdMock,
    claims: ['foo', 'bar'],
    scope: 'fizz buzz',
    dpId: 'dp_uid',
    dpClientId: 'dp_client_id',
    dpTitle: 'dp_title',
    browsingSessionId: undefined,
    reusesActiveSession: undefined,
    spId: undefined,
    spEssentialAcr: undefined,
    spName: undefined,
    idpId: undefined,
    idpAcr: undefined,
    idpName: undefined,
    idpLabel: undefined,
    idpIdentity: undefined,
  };

  const interactionAcrMock = 'interactionAcrMock';

  const sessionDataMock: UserSession = {
    browsingSessionId: 'browsingSessionId Mock Value',
    interactionId: interactionIdMock,
    interactionAcr: interactionAcrMock,

    spId: 'clientId',
    spName: 'some spName',
    spEssentialAcr: 'some spAcr',
    spIdentity: {} as any,

    idpId: 'some idpId',
    idpName: 'some idpName',
    idpLabel: 'some idpLabel',
    idpAcr: 'some idpAcr',
    idpIdentity: { sub: 'some idpSub' } as any,
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [CoreTrackingService, SessionService, ConfigService],
    })
      .overrideProvider(SessionService)
      .useValue(sessionServiceMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .compile();

    service = module.get<CoreTrackingService>(CoreTrackingService);

    sessionServiceMock.get.mockReturnValue(sessionDataMock);
    sessionServiceMock.getId.mockReturnValue(sessionIdMock);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('buildLog()', () => {
    const overrideWithSourceIfNotNullMock = jest.mocked(
      overrideWithSourceIfNotNull,
    );

    beforeEach(() => {
      service['extractContext'] = jest.fn().mockReturnValue(extractedValueMock);
      service['getDataFromSession'] = jest
        .fn()
        .mockReturnValue(sessionDataMock);
      overrideWithSourceIfNotNullMock.mockReturnValue({
        ...extractedValueMock,
        ...sessionDataMock,
      });
    });

    it('should call extractContext with req property of context param', () => {
      // Given
      // When
      service.buildLog(eventMock, contextMock);
      // Then
      expect(service['extractContext']).toHaveBeenCalledTimes(1);
      expect(service['extractContext']).toHaveBeenCalledWith(contextMock);
    });

    it('should return log message', () => {
      // Given
      const expectedResult = {
        ...sessionDataMock,
        interactionId: interactionIdMock,
        category: eventMock.category,
        event: eventMock.event,
        ip: ipMock,
        reusesActiveSession: undefined,
        source: {
          address: ipMock,
          port: sourcePortMock,
          // logs filter and analyses need this format
          // eslint-disable-next-line @typescript-eslint/naming-convention
          original_addresses: xForwardedForOriginalMock,
        },
        claims: 'foo bar',
        scope: 'fizz buzz',
        sessionId: 'sessionIdValue',
        dpId: 'dp_uid',
        dpClientId: 'dp_client_id',
        dpTitle: 'dp_title',
      };
      // When
      const result = service.buildLog(eventMock, contextMock);
      // Then
      expect(result).toEqual(expectedResult);
    });

    it('should return object containing joined claims', () => {
      // Given
      const contextMock = {
        req: {},
        claims: ['foo', 'bar'],
      };
      // When
      const result = service.buildLog(eventMock, contextMock);
      // Then
      expect(result).toEqual(expect.objectContaining({ claims: 'foo bar' }));
    });

    it('should return sessionId from context if provided', () => {
      // Given
      const contextWithSessionIdMock = {
        sessionId: Symbol('contextWithSessionIdMock'),
      };
      // When
      const result = service.buildLog(eventMock, contextWithSessionIdMock);
      // Then
      expect(result).toEqual(
        expect.objectContaining({
          sessionId: contextWithSessionIdMock.sessionId,
        }),
      );
    });

    it('should return object without claims if none provided', () => {
      // Given
      const contextMock = {
        req: {},
      };
      const extractedContextMockValue = { ...extractedValueMock };
      extractedContextMockValue['claims'] = undefined;
      service['extractContext'] = jest
        .fn()
        .mockReturnValueOnce(extractedContextMockValue);
      // When
      const result = service.buildLog(eventMock, contextMock);
      // Then
      expect(result).toEqual(
        expect.not.objectContaining({ claims: 'foo bar' }),
      );
    });
  });

  describe('extractContext()', () => {
    let extractNetworkInfoFromHeadersMock;

    beforeEach(() => {
      extractNetworkInfoFromHeadersMock = jest.mocked(
        extractNetworkInfoFromHeaders,
      );

      extractNetworkInfoFromHeadersMock.mockReturnValueOnce({
        address: ipMock,
        port: sourcePortMock,
        // logs filter and analyses need this format
        // eslint-disable-next-line @typescript-eslint/naming-convention
        original_addresses: xForwardedForOriginalMock,
      });
    });

    it('should return informations from context', () => {
      // Given
      const contextMock = {
        req: {
          cookies: {
            _interaction: interactionIdMock,
          },
        },
        claims: ['foo', 'bar'],
        scope: 'fizz buzz',
        dpId: 'dp_uid',
        dpClientId: 'dp_client_id',
        dpTitle: 'dp_title',
        interactionId: interactionIdMock,
        sessionId: sessionIdMock,
      };
      // When
      const result = service['extractContext'](contextMock);
      // Then
      expect(result).toEqual({
        ...extractedValueMock,
      });
    });

    it('should return informations from context with null for data provider information', () => {
      // Given
      const extractedValueWithNoDpMock: ICoreTrackingContext = {
        source: {
          address: ipMock,
          port: sourcePortMock,
          // logs filter and analyses need this format
          // eslint-disable-next-line @typescript-eslint/naming-convention
          original_addresses: xForwardedForOriginalMock,
        },
        sessionId: sessionIdMock,
        interactionId: interactionIdMock,
        claims: ['foo', 'bar'],
        scope: 'fizz buzz',
        dpId: undefined,
        dpClientId: undefined,
        dpTitle: undefined,
      };

      const contextMock = {
        req: {
          cookies: {
            _interaction: interactionIdMock,
          },
        },
        sessionId: sessionIdMock,
        claims: ['foo', 'bar'],
        scope: 'fizz buzz',
        interactionId: interactionIdMock,
      };
      // When
      const result = service['extractContext'](contextMock);
      // Then
      expect(result).toEqual(extractedValueWithNoDpMock);
    });
  });

  describe('getDataFromSession()', () => {
    it('should call session.get', () => {
      // When
      service['getDataFromSession'](sessionIdMock);
      // Then
      expect(sessionServiceMock.get).toHaveBeenCalledTimes(1);
      expect(sessionServiceMock.get).toHaveBeenNthCalledWith(1, 'User');
    });

    it('should return a default object with only sessionId, if session is not found', () => {
      // Given
      const expectedResult = {
        browsingSessionId: null,
        interactionId: null,
        interactionAcr: null,
        sessionId: sessionIdMock,
        reusesActiveSession: null,

        spId: null,
        spEssentialAcr: null,
        spName: null,
        spSub: null,

        idpId: null,
        idpAcr: null,
        idpName: null,
        idpLabel: null,
        idpSub: null,
      };
      sessionServiceMock.get
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(null);

      // When
      const result = service['getDataFromSession'](sessionIdMock);

      // Then
      expect(result).toEqual(expectedResult);
    });

    it('should return partial data from session.get', () => {
      // Given
      const expectedResult = {
        browsingSessionId: 'browsingSessionId Mock Value',
        sessionId: sessionIdMock,
        interactionId: interactionIdMock,
        interactionAcr: interactionAcrMock,
        reusesActiveSession: null,

        spId: 'clientId',
        spName: 'some spName',
        spEssentialAcr: 'some spAcr',
        spSub: null,

        idpId: 'some idpId',
        idpName: 'some idpName',
        idpAcr: 'some idpAcr',
        idpSub: 'some idpSub',
        idpLabel: 'some idpLabel',
      };
      // When
      const result = service['getDataFromSession'](sessionIdMock);
      // Then
      expect(result).toEqual(expectedResult);
    });

    it('should return null values for idp info and spSub if not set in session', () => {
      // Given
      const expectedResult = {
        browsingSessionId: browsingSessionIdMock,
        sessionId: sessionIdMock,
        interactionId: null,
        interactionAcr: null,
        reusesActiveSession: null,

        spId: 'spIdMock',
        spName: 'spNameMock',
        spEssentialAcr: 'spAcrMock',
        spSub: null,

        idpId: null,
        idpName: null,
        idpAcr: null,
        idpSub: null,
        idpLabel: null,
      };
      const sessionMock: UserSession = {
        spId: 'spIdMock',
        spName: 'spNameMock',
        spEssentialAcr: 'spAcrMock',
        browsingSessionId: browsingSessionIdMock,
      };
      sessionServiceMock.get.mockReturnValueOnce(sessionMock);

      // When
      const result = service['getDataFromSession'](sessionIdMock);

      // Then
      expect(result).toEqual(expectedResult);
    });

    it('should return null values for `idp` info if not set in session', () => {
      // Given
      const expectedResult = {
        sessionId: sessionIdMock,
        browsingSessionId: browsingSessionIdMock,
        interactionId: null,
        interactionAcr: null,
        reusesActiveSession: null,

        spId: 'spIdMock',
        spName: 'spNameMock',
        spEssentialAcr: 'spAcrMock',
        spSub: null,

        idpId: null,
        idpName: null,
        idpAcr: null,
        idpSub: null,
        idpLabel: null,
      };
      const sessionMock: UserSession = {
        spId: 'spIdMock',
        spName: 'spNameMock',
        spEssentialAcr: 'spAcrMock',
        spIdentity: {} as any,
        browsingSessionId: browsingSessionIdMock,
      };
      sessionServiceMock.get.mockReturnValueOnce(sessionMock);

      // When
      const result = service['getDataFromSession'](sessionIdMock);

      // Then
      expect(result).toEqual(expectedResult);
    });

    it('should return null values for `sp` info if not set in session', () => {
      // Given
      const expectedResult = {
        sessionId: sessionIdMock,
        browsingSessionId: browsingSessionIdMock,
        interactionId: null,
        interactionAcr: null,
        reusesActiveSession: null,

        spId: null,
        spName: null,
        spEssentialAcr: null,
        spSub: null,

        idpId: null,
        idpName: null,
        idpAcr: null,
        idpSub: null,
        idpLabel: null,
      };
      const sessionMock: UserSession = {
        spIdentity: {} as any,
        browsingSessionId: browsingSessionIdMock,
      };
      sessionServiceMock.get.mockReturnValueOnce(sessionMock);

      // When
      const result = service['getDataFromSession'](sessionIdMock);

      // Then
      expect(result).toEqual(expectedResult);
    });
  });
});
