import { ModuleRef } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';
import { CoreMissingAuthenticationEmailException } from '@fc/core';
import { FeatureHandler } from '@fc/feature-handler';
import { IdentityProviderService } from '@fc/identity-provider';
import { CoreFcpService } from './core-fcp.service';

describe('CoreFcpService', () => {
  let service: CoreFcpService;

  const loggerServiceMock = {
    setContext: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
  };

  const uidMock = '42';

  const sessionServiceMock = {
    get: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };

  const spIdentityMock = {
    // oidc parameter
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

  const featureHandlerGetSpy = jest.spyOn(FeatureHandler, 'get');

  const featureHandlerServiceMock = {
    handle: jest.fn(),
  };

  const moduleRefMock = {
    get: jest.fn(),
  };

  const IdentityProviderMock = {
    getById: jest.fn(),
  };

  const coreVerifyMock = 'core-fcp-default-verify';
  const authenticationEmailMock = 'core-fcp-send-email';

  const IdentityProviderResultMock = {
    featureHandlers: {
      coreVerify: coreVerifyMock,
      authenticationEmail: authenticationEmailMock,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoreFcpService,
        LoggerService,
        SessionService,
        IdentityProviderService,
      ],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(SessionService)
      .useValue(sessionServiceMock)
      .overrideProvider(IdentityProviderService)
      .useValue(IdentityProviderMock)
      .overrideProvider(ModuleRef)
      .useValue(moduleRefMock)
      .compile();

    service = module.get<CoreFcpService>(CoreFcpService);

    jest.resetAllMocks();

    sessionServiceMock.get.mockResolvedValue(sessionDataMock);
    featureHandlerGetSpy.mockResolvedValueOnce(featureHandlerServiceMock);
    IdentityProviderMock.getById.mockResolvedValue(IdentityProviderResultMock);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verify', () => {
    it('should return a promise', async () => {
      // action
      const result = service.verify(reqMock);
      await result;
      // expect
      expect(result).toBeInstanceOf(Promise);
    });

    it('Should call session.get() with `interactionId`', async () => {
      // Given
      // When
      await service.verify(reqMock);
      // Then
      expect(sessionServiceMock.get).toBeCalledTimes(1);
      expect(sessionServiceMock.get).toBeCalledWith(uidMock);
    });

    it('Should call `FeatureHandler.get()` to get instantiated featureHandler class', async () => {
      // Given
      // When
      await service.verify(reqMock);
      // Then
      expect(featureHandlerGetSpy).toBeCalledTimes(1);
      expect(featureHandlerGetSpy).toBeCalledWith(coreVerifyMock, service);
    });

    it('Should call featureHandle.handle() with `req`', async () => {
      // Given
      // When
      await service.verify(reqMock);
      // Then
      expect(featureHandlerServiceMock.handle).toBeCalledTimes(1);
      expect(featureHandlerServiceMock.handle).toBeCalledWith(reqMock);
    });
  });

  describe('sendAuthenticationMail', () => {
    it('should return a promise', async () => {
      // action
      const result = service.sendAuthenticationMail(reqMock);
      await result;
      // expect
      expect(result).toBeInstanceOf(Promise);
    });

    it('Should call session.get() with `interactionId`', async () => {
      // Given
      // When
      await service.sendAuthenticationMail(reqMock);
      // Then
      expect(sessionServiceMock.get).toBeCalledTimes(1);
      expect(sessionServiceMock.get).toBeCalledWith(uidMock);
    });

    it('Should call `FeatureHandler.get()` to get instantiated featureHandler class', async () => {
      // Given
      // When
      await service.sendAuthenticationMail(reqMock);
      // Then
      expect(featureHandlerGetSpy).toBeCalledTimes(1);
      expect(featureHandlerGetSpy).toBeCalledWith(
        authenticationEmailMock,
        service,
      );
    });

    it("Should throw `CoreMissingAuthenticationEmailException` if the feature handler doesn't exists", async () => {
      // Given
      featureHandlerGetSpy.mockReset().mockImplementationOnce(() => {
        throw new Error();
      });
      IdentityProviderMock.getById.mockResolvedValue({
        featureHandlers: {
          coreVerify: coreVerifyMock,
          authenticationEmail: undefined,
        },
      });
      // When, Then
      await expect(service.sendAuthenticationMail(reqMock)).rejects.toThrow(
        CoreMissingAuthenticationEmailException,
      );
    });

    it('Should call featureHandle.handle() with `req`', async () => {
      // Given
      // When
      await service.sendAuthenticationMail(reqMock);
      // Then
      expect(featureHandlerServiceMock.handle).toBeCalledTimes(1);
      expect(featureHandlerServiceMock.handle).toBeCalledWith(reqMock);
    });
  });
});
