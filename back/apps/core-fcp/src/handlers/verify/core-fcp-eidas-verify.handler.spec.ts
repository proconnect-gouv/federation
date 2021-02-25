import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';
import { TrackingService } from '@fc/tracking';
import { CoreService } from '@fc/core';
import { ConfigService } from '@fc/config';
import { ServiceProviderService } from '@fc/service-provider';
import { CoreFcpEidasVerifyHandler } from './core-fcp-eidas-verify.handler';

describe('CoreFcpEidasVerifyHandler', () => {
  let service: CoreFcpEidasVerifyHandler;

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

  const computeInteractionMock = { spInteraction: {} };

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

  const serviceProviderMock = {
    getById: jest.fn(),
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        CoreService,
        CoreFcpEidasVerifyHandler,
        LoggerService,
        SessionService,
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
      .overrideProvider(TrackingService)
      .useValue(trackingMock)
      .overrideProvider(ServiceProviderService)
      .useValue(serviceProviderMock)
      .compile();

    service = module.get<CoreFcpEidasVerifyHandler>(CoreFcpEidasVerifyHandler);

    jest.resetAllMocks();

    getInteractionMock.mockResolvedValue(getInteractionResultMock);
    sessionServiceMock.get.mockResolvedValue(sessionDataMock);
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
        amr: ['eidas'],
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
          spIdentity: sessionDataMock.idpIdentity,
        },
      );
    });

    /**
     * @TODO #134 Test when implemented
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
});
