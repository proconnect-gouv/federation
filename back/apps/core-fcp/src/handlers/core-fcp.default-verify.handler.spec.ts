import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';
import {
  RnippService,
  RnippRequestedEvent,
  RnippReceivedValidEvent,
} from '@fc/rnipp';
import { AccountBlockedException } from '@fc/account';
import { TrackingService } from '@fc/tracking';
import { CoreService } from '@fc/core';
import { ConfigService } from '@fc/config';
import { ServiceProviderService } from '@fc/service-provider';
import { CoreFcpDefaultVerifyHandler } from './core-fcp.default-verify.handler';

describe('CoreFcpDefaultVerifyHandler', () => {
  let service: CoreFcpDefaultVerifyHandler;

  const loggerServiceMock = {
    setContext: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
  };

  const uidMock = '42';

  const getInteractionResultMock = {
    prompt: {},

    params: {
      // oidc param
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: 'eidas3',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      client_id: 'spId',
    },
    uid: uidMock,
  };
  const getInteractionMock = jest.fn();

  const sessionServiceMock = {
    get: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };

  const rnippServiceMock = {
    check: jest.fn(),
  };

  const spIdentityMock = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    given_name: 'Edward',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    family_name: 'TEACH',
    email: 'eteach@fqdn.ext',
  };

  const idpIdentityMock = {
    sub: 'some idpSub',
  };

  const reqMock = {
    fc: { interactionId: uidMock },
    ip: '123.123.123.123',
  };

  const configServiceMock = {
    get: jest.fn(),
  };

  const trackingMock = {
    track: jest.fn(),
  };

  const coreServiceMock = {
    checkIfAccountIsBlocked: jest.fn(),
    checkIfAcrIsValid: jest.fn(),
    computeInteraction: jest.fn(),
  };

  const sessionDataMock = {
    idpId: '42',
    idpAcr: 'eidas3',
    idpName: 'my favorite Idp',
    idpIdentity: idpIdentityMock,

    spId: 'sp_id',
    spAcr: 'eidas3',
    spName: 'my great SP',
    spIdentity: spIdentityMock,
  };

  const computeInteractionMock = { spInteraction: {} };

  const serviceProviderMock = {
    getById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        CoreService,
        CoreFcpDefaultVerifyHandler,
        LoggerService,
        SessionService,
        RnippService,
        TrackingService,
        ServiceProviderService,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(CoreService)
      .useValue(coreServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(SessionService)
      .useValue(sessionServiceMock)
      .overrideProvider(RnippService)
      .useValue(rnippServiceMock)
      .overrideProvider(TrackingService)
      .useValue(trackingMock)
      .overrideProvider(ServiceProviderService)
      .useValue(serviceProviderMock)
      .compile();

    service = module.get<CoreFcpDefaultVerifyHandler>(
      CoreFcpDefaultVerifyHandler,
    );

    jest.resetAllMocks();

    getInteractionMock.mockResolvedValue(getInteractionResultMock);
    sessionServiceMock.get.mockResolvedValue(sessionDataMock);
    rnippServiceMock.check.mockResolvedValue(spIdentityMock);
    coreServiceMock.computeInteraction.mockResolvedValue(
      computeInteractionMock,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handle', () => {
    const spMock = {
      key: '123456',
      entityId: 'AAAABBBBCCCCDDDDEEEEFFFFGGGGHHHH',
    };
    beforeEach(() => {
      serviceProviderMock.getById.mockResolvedValue(spMock);
    });

    it('Should not throw if verified', async () => {
      // Then
      await expect(service.handle(reqMock)).resolves.not.toThrow();
    });

    it('Should throw if account is blocked', async () => {
      // Given
      const errorMock = new AccountBlockedException();
      coreServiceMock.checkIfAccountIsBlocked.mockRejectedValueOnce(errorMock);

      // Then
      await expect(service.handle(reqMock)).rejects.toThrow(errorMock);
    });

    // Dependencies sevices errors
    it('Should throw if acr is not validated', async () => {
      // Given
      const errorMock = new Error('my error 1');
      coreServiceMock.checkIfAcrIsValid.mockImplementation(() => {
        throw errorMock;
      });
      // Then
      await expect(service.handle(reqMock)).rejects.toThrow(errorMock);
    });

    it('Should throw if identity provider is not usable', async () => {
      // Given
      const errorMock = new Error('my error');
      sessionServiceMock.get.mockRejectedValueOnce(errorMock);
      // Then
      await expect(service.handle(reqMock)).rejects.toThrow(errorMock);
    });

    it('Should throw if service Provider service fails', async () => {
      // Given
      const errorMock = new Error('my error');
      serviceProviderMock.getById.mockReset().mockRejectedValueOnce(errorMock);

      // When
      await expect(service.handle(reqMock)).rejects.toThrow(errorMock);
    });

    it('Should throw if rnipp check refuses identity', async () => {
      // Given
      const errorMock = new Error('my error');
      rnippServiceMock.check.mockRejectedValueOnce(errorMock);
      // Then
      await expect(service.handle(reqMock)).rejects.toThrow(errorMock);
    });

    it('Should throw if identity storage for service provider fails', async () => {
      // Given
      const errorMock = new Error('my error');
      sessionServiceMock.patch.mockRejectedValueOnce(errorMock);
      // Then
      await expect(service.handle(reqMock)).rejects.toThrow(errorMock);
    });

    it('Should call session patch with amr parameter', async () => {
      // When
      await service.handle(reqMock);
      // Then
      expect(sessionServiceMock.patch).toHaveBeenCalledTimes(1);
      expect(sessionServiceMock.patch).toHaveBeenCalledWith(uidMock, {
        amr: ['fc'],
        idpIdentity: { sub: 'some idpSub' },
        spIdentity: { sub: undefined },
      });
    });

    it('Should call computeInteraction()', async () => {
      // When
      await service.handle(reqMock);
      // Then
      expect(coreServiceMock.computeInteraction).toHaveBeenCalledTimes(1);
      expect(coreServiceMock.computeInteraction).toBeCalledWith(
        {
          idpId: sessionDataMock.idpId,
          idpIdentity: sessionDataMock.idpIdentity,
        },
        {
          spId: sessionDataMock.spId,
          spRef: spMock.entityId,
          spIdentity: sessionDataMock.spIdentity,
        },
      );
    });

    /**
     * @TODO #134 ETQ FC, je suis résiliant aux fails du RNIPP
     * Test when implemented
     * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/134
     *
     * // RNIPP resilience
     * it('Should pass if rnipp is down and account is known', async () => {});
     * it('Should throw if rnipp is down and account is unknown', async () => {});
     *
     * // Service provider usability
     * it('Should throw if service provider is not usable ', async () => {});
     */
  });

  describe('rnippCheck', () => {
    it('should not throw if rnipp service does not', async () => {
      // Then
      expect(
        service['rnippCheck'](spIdentityMock, reqMock),
      ).resolves.not.toThrow();
    });

    it('should return rnippIdentity', async () => {
      // When
      const result = await service['rnippCheck'](spIdentityMock, reqMock);
      // Then
      expect(result).toBe(spIdentityMock);
    });

    it('should publish events when searching', async () => {
      // When
      await service['rnippCheck'](spIdentityMock, reqMock);
      // Then
      expect(trackingMock.track).toHaveBeenCalledTimes(2);
      expect(trackingMock.track).toHaveBeenCalledWith(
        RnippRequestedEvent,
        expect.any(Object),
      );
      expect(trackingMock.track).toHaveBeenCalledWith(
        RnippReceivedValidEvent,
        expect.any(Object),
      );
    });

    it('should add interactionId and Ip address properties in published events', async () => {
      // Given
      const expectedEventStruct = {
        fc: { interactionId: '42' },
        ip: '123.123.123.123',
      };
      // When
      await service['rnippCheck'](spIdentityMock, reqMock);
      // Then
      expect(trackingMock.track).toHaveBeenCalledTimes(2);
      expect(trackingMock.track).toHaveBeenCalledWith(
        RnippRequestedEvent,
        expectedEventStruct,
      );
      expect(trackingMock.track).toHaveBeenCalledWith(
        RnippReceivedValidEvent,
        expectedEventStruct,
      );
    });
  });
});
