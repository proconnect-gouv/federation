import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';
import { CoreService } from '@fc/core';
import { AccountBlockedException } from '@fc/account';
import { CryptographyFcaService } from '@fc/cryptography-fca';
import { CoreFcaDefaultVerifyHandler } from './core-fca.default-verify.handler';

describe('CoreFcaDefaultVerifyHandler', () => {
  let service: CoreFcaDefaultVerifyHandler;

  const loggerServiceMock = {
    setContext: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
  };

  const uidMock = '42';

  const coreServiceMock = {
    checkIfAccountIsBlocked: jest.fn(),
    checkIfAcrIsValid: jest.fn(),
    computeInteraction: jest.fn(),
  };

  const sessionServiceMock = {
    get: jest.fn(),
    patch: jest.fn(),
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
    // Oidc Naming convention
    // eslint-disable-next-line @typescript-eslint/naming-convention
    given_name: 'givenNameValue',
    uid: 'uidValue',
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

  const cryptographyFcaServiceMock = {
    computeSubV1: jest.fn(),
    computeIdentityHash: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoreFcaDefaultVerifyHandler,
        LoggerService,
        SessionService,
        CoreService,
        CryptographyFcaService,
      ],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(SessionService)
      .useValue(sessionServiceMock)
      .overrideProvider(CoreService)
      .useValue(coreServiceMock)
      .overrideProvider(CryptographyFcaService)
      .useValue(cryptographyFcaServiceMock)
      .compile();

    service = module.get<CoreFcaDefaultVerifyHandler>(
      CoreFcaDefaultVerifyHandler,
    );

    jest.resetAllMocks();
    jest.restoreAllMocks();

    sessionServiceMock.get.mockResolvedValue(sessionDataMock);
    cryptographyFcaServiceMock.computeIdentityHash.mockReturnValueOnce(
      'spIdentityHash',
    );
    cryptographyFcaServiceMock.computeSubV1.mockReturnValueOnce(
      'computedSubSp',
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handle', () => {
    it('Should not throw if verified', async () => {
      // Then
      await expect(service.handle(reqMock)).resolves.not.toThrow();
    });

    it('Should throw if identity provider is not usable', async () => {
      // Given
      const errorMock = new Error('my error');
      sessionServiceMock.get.mockRejectedValueOnce(errorMock);
      // Then
      await expect(service.handle(reqMock)).rejects.toThrow(errorMock);
    });

    describe('Acr', () => {
      // Dependencies services errors
      it('Should throw if acr is not validated', async () => {
        // Given
        const errorMock = new Error('my error 1');
        coreServiceMock.checkIfAcrIsValid.mockImplementation(() => {
          throw errorMock;
        });
        // Then
        await expect(service.handle(reqMock)).rejects.toThrow(errorMock);
      });
    });

    it('should call computeIdentityHash with idp identity and idp id', async () => {
      // When
      await service.handle(reqMock);

      // Then
      expect(
        cryptographyFcaServiceMock.computeIdentityHash,
      ).toHaveBeenCalledTimes(1);
      expect(
        cryptographyFcaServiceMock.computeIdentityHash,
      ).toHaveBeenNthCalledWith(1, sessionDataMock.idpId, idpIdentityMock);
    });

    describe('Account', () => {
      it('Should throw if account is blocked', async () => {
        // Given
        const errorMock = new AccountBlockedException();
        coreServiceMock.checkIfAccountIsBlocked.mockRejectedValueOnce(
          errorMock,
        );

        // Then
        await expect(service.handle(reqMock)).rejects.toThrow(errorMock);
      });
    });

    it('Should call compute Sub for Sp based on identity hash', async () => {
      // When
      await service.handle(reqMock);

      // Then
      expect(cryptographyFcaServiceMock.computeSubV1).toHaveBeenCalledTimes(1);
      expect(cryptographyFcaServiceMock.computeSubV1).toHaveBeenNthCalledWith(
        1,
        sessionDataMock.spId,
        'spIdentityHash',
      );
    });

    describe('computeInteraction', () => {
      it('Should call computeInteraction() with sp and idp data', async () => {
        // When
        await service.handle(reqMock);
        // Then
        expect(coreServiceMock.computeInteraction).toHaveBeenCalledTimes(1);
        expect(coreServiceMock.computeInteraction).toBeCalledWith(
          {
            spId: sessionDataMock.spId,
            subSp: 'computedSubSp',
            hashSp: 'spIdentityHash',
          },
          {
            idpId: sessionDataMock.idpId,
            subIdp: idpIdentityMock.sub,
          },
        );
      });

      it('Should throw an error if computeInteraction failed', async () => {
        // Given
        const errorMock = new Error('my error');
        coreServiceMock.computeInteraction.mockRejectedValueOnce(errorMock);
        // Then
        await expect(service.handle(reqMock)).rejects.toThrow(errorMock);
      });
    });

    describe('Session patch', () => {
      it('Should patch the session with idp and sp identity', async () => {
        // Given

        const calledMock = {
          idpIdentity: { sub: idpIdentityMock.sub },
          spIdentity: {
            sub: 'computedSubSp',
            // Oidc naming convention
            // eslint-disable-next-line @typescript-eslint/naming-convention
            given_name: idpIdentityMock.given_name,
            uid: idpIdentityMock.uid,
          },
        };
        // When
        await service.handle(reqMock);

        // Then
        expect(sessionServiceMock.patch).toHaveBeenCalledTimes(1);
        expect(sessionServiceMock.patch).toHaveBeenCalledWith(
          uidMock,
          calledMock,
        );
      });
      it('Should throw if identity storage for service provider fails', async () => {
        // Given
        const errorMock = new Error('my error');
        sessionServiceMock.patch.mockRejectedValueOnce(errorMock);
        // Then
        await expect(service.handle(reqMock)).rejects.toThrow(errorMock);
      });
    });
  });
});
