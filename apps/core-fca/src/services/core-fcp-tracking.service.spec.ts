import { Test, TestingModule } from '@nestjs/testing';
import { SessionService } from '@fc/session';
import { ConfigService } from '@fc/config';
import { CoreFcpTrackingService } from './core-fcp-tracking.service';
import { CoreFcpMissingContext } from '../exceptions';

describe('CoreFcpTrackingService', () => {
  let service: CoreFcpTrackingService;

  const sessionMock = {
    get: jest.fn(),
  };

  const appConfigMock = {
    urlPrefix: '/api/v2',
  };
  const configServiceMock = {
    get: () => appConfigMock,
  };

  const eventMock = {
    step: '1',
    category: 'some category',
    event: 'name',
    exceptions: [],
    route: '/',
    intercept: false,
  };
  const ipMock = '123.123.123.123';
  const interactionIdMock = 'some_interaction_id';

  const contextMock = {
    req: {
      ip: ipMock,
      fc: {
        interactionId: interactionIdMock,
      },
    },
  };

  const sessionDataMock = {
    spId: 'some spId',
    spName: 'some spName',
    spAcr: 'some spAcr',
    spIdentity: { sub: 'some spSub' },

    idpId: 'some idpId',
    idpName: 'some idpName',
    idpAcr: 'some idpAcr',
    idpIdentity: { sub: 'some idpSub' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoreFcpTrackingService, SessionService, ConfigService],
    })
      .overrideProvider(SessionService)
      .useValue(sessionMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .compile();

    service = module.get<CoreFcpTrackingService>(CoreFcpTrackingService);
    jest.resetAllMocks();

    sessionMock.get.mockResolvedValue(sessionDataMock);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('buildLog', () => {
    it('should call extractContext with req property of context param', async () => {
      // Given
      service['extractContext'] = jest.fn();
      // When
      service.buildLog(eventMock, contextMock);
      // Then
      expect(service['extractContext']).toHaveBeenCalledTimes(1);
      expect(service['extractContext']).toHaveBeenCalledWith(contextMock);
    });

    it('should call service.getDataFromContext if event is FCP_AUTHORIZE_INITIATED', async () => {
      // Given
      service['getDataFromContext'] = jest.fn();
      service['getDataFromSession'] = jest.fn();
      // When
      await service.buildLog(
        service.EventsMap.FCP_AUTHORIZE_INITIATED,
        contextMock,
      );
      // Then
      expect(service['getDataFromContext']).toHaveBeenCalledTimes(1);
      expect(service['getDataFromContext']).toHaveBeenCalledWith(contextMock);
      expect(service['getDataFromSession']).toHaveBeenCalledTimes(0);
    });

    it('should call service.getDataFromContext if event is not FCP_AUTHORIZE_INITIATED', async () => {
      // Given
      service['getDataFromContext'] = jest.fn();
      service['getDataFromSession'] = jest.fn();
      // When
      await service.buildLog(
        service.EventsMap.FCP_SHOWED_IDP_CHOICE,
        contextMock,
      );
      // Then
      expect(service['getDataFromContext']).toHaveBeenCalledTimes(0);
      expect(service['getDataFromSession']).toHaveBeenCalledTimes(1);
      expect(service['getDataFromSession']).toHaveBeenCalledWith(
        interactionIdMock,
      );
    });

    it('should return log message', async () => {
      // Given
      const expectedResult = {
        interactionId: interactionIdMock,
        step: eventMock.step,
        category: eventMock.category,
        event: eventMock.event,
        ip: ipMock,

        spId: 'some spId',
        spName: 'some spName',
        spAcr: 'some spAcr',
        spSub: 'some spSub',

        idpId: 'some idpId',
        idpName: 'some idpName',
        idpAcr: 'some idpAcr',
        idpSub: 'some idpSub',
      };
      // When
      const result = await service.buildLog(eventMock, contextMock);
      // Then
      expect(result).toEqual(expectedResult);
    });
  });

  describe('extractContext', () => {
    it('should return informations from context', () => {
      // Given
      const expectedResult = {
        ip: ipMock,
        interactionId: interactionIdMock,
      };
      // When
      const result = service['extractContext'](contextMock);
      // Then
      expect(result).toEqual(expectedResult);
    });

    it('should throw if req is missing', () => {
      // Given
      const contextMock = { foo: 'bar' };
      // Then
      expect(() => service['extractContext'](contextMock)).toThrow(
        CoreFcpMissingContext,
      );
    });
    it('should throw if ip is missing', () => {
      // Given
      const contextMock = { req: { fc: { interactionId: 'foo' } } };
      // Then
      expect(() => service['extractContext'](contextMock)).toThrow(
        CoreFcpMissingContext,
      );
    });
    it('should throw if fc is missing', () => {
      // Given
      const contextMock = { req: { ip: 'bar' } };
      // Then
      expect(() => service['extractContext'](contextMock)).toThrow(
        CoreFcpMissingContext,
      );
    });
    it('should throw if interactionId is missing', () => {
      // Given
      const contextMock = { req: { ip: 'bar', fc: {} } };
      // Then
      expect(() => service['extractContext'](contextMock)).toThrow(
        CoreFcpMissingContext,
      );
    });
  });

  describe('getDataFromSession', () => {
    it('should call session.get', async () => {
      // When
      await service['getDataFromSession'](interactionIdMock);
      // Then
      expect(sessionMock.get).toHaveBeenCalledTimes(1);
      expect(sessionMock.get).toHaveBeenCalledWith(interactionIdMock);
    });
    it('Should return partial data from session.get', async () => {
      // Given
      const expectedResult = {
        spId: 'some spId',
        spName: 'some spName',
        spAcr: 'some spAcr',
        spSub: 'some spSub',

        idpId: 'some idpId',
        idpName: 'some idpName',
        idpAcr: 'some idpAcr',
        idpSub: 'some idpSub',
      };
      // When
      const result = await service['getDataFromSession'](interactionIdMock);
      // Then
      expect(result).toEqual(expectedResult);
    });

    it('should return null values for idp info and spSub if not set in session', async () => {
      // Given
      const expectedResult = {
        spId: 'spIdMock',
        spName: 'spNameMock',
        spAcr: 'spAcrMock',
        spSub: null,

        idpId: null,
        idpName: null,
        idpAcr: null,
        idpSub: null,
      };
      sessionMock.get.mockResolvedValueOnce({
        spId: 'spIdMock',
        spName: 'spNameMock',
        spAcr: 'spAcrMock',
      });
      // When
      const result = await service['getDataFromSession'](interactionIdMock);
      // Then
      expect(result).toEqual(expectedResult);
    });

    it('should return null values for idp info if not set in session', async () => {
      // Given
      const expectedResult = {
        spId: 'spIdMock',
        spName: 'spNameMock',
        spAcr: 'spAcrMock',
        spSub: 'spSubMock',

        idpId: null,
        idpName: null,
        idpAcr: null,
        idpSub: null,
      };
      sessionMock.get.mockResolvedValueOnce({
        spId: 'spIdMock',
        spName: 'spNameMock',
        spAcr: 'spAcrMock',
        spIdentity: { sub: 'spSubMock' },
      });
      // When
      const result = await service['getDataFromSession'](interactionIdMock);
      // Then
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getDataFromContext', () => {
    it('Should return partial data from context and null values', () => {
      // Given
      const expectedResult = {
        spId: 'spIdMock',
        spName: 'spNameMock',
        spAcr: 'spAcrMock',
        spSub: 'spSubMock',

        idpId: null,
        idpName: null,
        idpAcr: null,
        idpSub: null,
      };
      const myContextMock = {
        ...contextMock,
        req: {
          spId: 'spIdMock',
          spName: 'spNameMock',
          spAcr: 'spAcrMock',
          spSub: 'spSubMock',
        },
      };
      // When
      const result = service['getDataFromContext'](myContextMock);
      // Then
      expect(result).toEqual(expectedResult);
    });
  });
  it('should throw if req is missing', () => {
    // Given
    const contextMock = {};
    // Then
    expect(() => service['getDataFromContext'](contextMock)).toThrow(
      CoreFcpMissingContext,
    );
  });
});
