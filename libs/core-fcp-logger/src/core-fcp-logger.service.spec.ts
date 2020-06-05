import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { ServiceProviderService } from '@fc/service-provider';
import { SessionService } from '@fc/session';
import { CoreFcpLoggerService } from './core-fcp-logger.service';

describe('CoreFcpLoggerService', () => {
  let service: CoreFcpLoggerService;

  const loggerMock = {
    setContext: jest.fn(),
    businessEvent: jest.fn(),
  };

  const spMock = { name: 'Some SP Name' };
  const serviceProviderMock = {
    getById: jest.fn(),
  };

  const sessionMock = {
    get: jest.fn(),
  };
  const paramsMock = {
    step: '1',
    category: 'some category',
    event: 'name',
  };
  const ipMock = '123.123.123.123';
  const interactionIdMock = 'some_interaction_id';

  const sessionDataMock = {
    spId: 'some spId',
    spAcr: 'some spAcr',
    spName: 'some spName',
    idpId: 'some idpId',
    idpName: 'some idpName',
    idpAcr: 'some idpAcr',
  };

  const propertiesMock = {
    interactionId: 'Some interaction',
    ip: '123.123.123.123',
    spId: 'SP Identifier',
    spAcr: 'eidas2',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoreFcpLoggerService,
        LoggerService,
        ServiceProviderService,
        SessionService,
      ],
    })

      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .overrideProvider(ServiceProviderService)
      .useValue(serviceProviderMock)
      .overrideProvider(SessionService)
      .useValue(sessionMock)

      .compile();

    service = module.get<CoreFcpLoggerService>(CoreFcpLoggerService);
    jest.resetAllMocks();

    sessionMock.get.mockResolvedValue(sessionDataMock);
    serviceProviderMock.getById.mockResolvedValue(spMock);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('logEvent', () => {
    it('should call LoggerService.businessEvent', async () => {
      // When
      await service.logEvent(paramsMock, ipMock, interactionIdMock);
      // Then
      expect(loggerMock.businessEvent).toHaveBeenCalledTimes(1);
      expect(loggerMock.businessEvent).toHaveBeenCalledWith({
        interactionId: interactionIdMock,
        ip: ipMock,
        ...paramsMock,
        ...sessionDataMock,
      });
    });
    it('should default idp infos to null', async () => {
      // Given
      sessionMock.get.mockResolvedValueOnce({
        spId: 'some spId',
        spAcr: 'some spAcr',
        spName: 'some spName',
      });
      // When
      await service.logEvent(paramsMock, ipMock, interactionIdMock);
      // Then
      expect(loggerMock.businessEvent).toHaveBeenCalledTimes(1);
      expect(loggerMock.businessEvent).toHaveBeenCalledWith({
        interactionId: interactionIdMock,
        ip: ipMock,
        ...paramsMock,
        ...sessionDataMock,
        idpId: null,
        idpName: null,
        idpAcr: null,
      });
    });
  });
  describe('logAuthorize', () => {
    it('should call ServiceProviderService.getById', async () => {
      // When
      await service.logAuthorize(paramsMock, propertiesMock);
      // Then
      expect(serviceProviderMock.getById).toHaveBeenCalledTimes(1);
      expect(serviceProviderMock.getById).toHaveBeenCalledWith(
        propertiesMock.spId,
      );
    });
    it('should call LoggerService.businessEvent', async () => {
      // When
      await service.logAuthorize(paramsMock, propertiesMock);
      // Then
      expect(loggerMock.businessEvent).toHaveBeenCalledTimes(1);
      expect(loggerMock.businessEvent).toHaveBeenCalledWith({
        ...paramsMock,
        ...propertiesMock,
        spName: spMock.name,
      });
    });
  });
});
