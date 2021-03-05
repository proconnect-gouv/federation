import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { ConfigService } from '@fc/config';
import { OidcProviderService, OidcCtx } from '@fc/oidc-provider';
import { CryptographyFcpService } from '@fc/cryptography-fcp';
import { AccountService, AccountBlockedException } from '@fc/account';
import { CoreLowAcrException, CoreInvalidAcrException } from '../exceptions';
import { CoreService } from './core.service';
import { ComputeSp, ComputeIdp } from '../types';

describe('CoreService', () => {
  let service: CoreService;

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

  const oidcProviderServiceMock = {
    getInteraction: getInteractionMock,
    registerMiddleware: jest.fn(),
  };

  const sessionServiceMock = {
    get: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };

  const accountServiceMock = {
    storeInteraction: jest.fn(),
    isBlocked: jest.fn(),
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

  const cryptographyFcpServiceMock = {
    computeIdentityHash: jest.fn(),
    computeSubV1: jest.fn(),
  };

  const configServiceMock = {
    get: jest.fn(),
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

  const entityIdMock = 'myEntityId';
  const subSpMock = 'MockedSpSub';
  const rnippidentityHashMock = 'rnippIdentityHashed';
  const subIdpMock = 'MockedIdpSub';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoreService,
        LoggerService,
        ConfigService,
        OidcProviderService,
        CryptographyFcpService,
        AccountService,
      ],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(OidcProviderService)
      .useValue(oidcProviderServiceMock)
      .overrideProvider(CryptographyFcpService)
      .useValue(cryptographyFcpServiceMock)
      .overrideProvider(AccountService)
      .useValue(accountServiceMock)
      .compile();

    configServiceMock.get.mockReturnValue({
      forcedPrompt: ['testprompt'],
      configuration: {
        routes: { authorization: '/foo' },
      },
      // OidcProvider.configuration
      acrValues: ['Boots', 'Motorcycles', 'Glasses'],
    });

    service = module.get<CoreService>(CoreService);

    getInteractionMock.mockResolvedValue(getInteractionResultMock);
    sessionServiceMock.get.mockResolvedValue(sessionDataMock);
    accountServiceMock.isBlocked.mockResolvedValue(false);

    /**
     * @TODO #258
     * ETQ Dev, je "clear" également les mocks au lieu de seulement les "reset"
     * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/258
     */
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should register ovrrideAuthorizePrompt middleware', () => {
      // Given
      service['overrideAuthorizePrompt'] = jest.fn();
      service['overrideAuthorizeAcrValues'] = jest.fn();
      // When
      service.onModuleInit();
      // Then
      expect(oidcProviderServiceMock.registerMiddleware).toHaveBeenCalledTimes(
        2,
      );
      expect(service['overrideAuthorizePrompt']).toHaveBeenCalledTimes(0);
      expect(service['overrideAuthorizeAcrValues']).toHaveBeenCalledTimes(0);
    });
  });

  describe('getFederation', () => {
    it('should return an object containing the provider sub, having the entityId as key if it exist', () => {
      // Given
      const subSpMock = 'spMockedSub';

      // When
      const result = service['getFederation'](
        sessionDataMock.spId,
        subSpMock,
        entityIdMock,
      );

      // Then
      expect(result).toEqual({ myEntityId: { sub: subSpMock } });
    });

    it('should return an object containing the provider sub, having the providerId as key if entityId does not exist', () => {
      // Given
      const subIdpMock = 'idpMockedSub';

      // When
      const result = service['getFederation'](
        sessionDataMock.idpId,
        subIdpMock,
      );

      // Then
      expect(result).toEqual({ [sessionDataMock.idpId]: { sub: subIdpMock } });
    });
  });

  describe('computeInteraction', () => {
    const computeSp: ComputeSp = {
      spId: sessionDataMock.spId,
      entityId: entityIdMock,
      subSp: subSpMock,
      hashSp: rnippidentityHashMock,
    };
    const computeIdp: ComputeIdp = {
      idpId: sessionDataMock.idpId,
      subIdp: subIdpMock,
    };

    it('should call getFederation to get spFederation', async () => {
      // Given
      service['getFederation'] = jest.fn();
      accountServiceMock.storeInteraction.mockResolvedValue('saved');
      // When
      await service.computeInteraction(computeSp, computeIdp);
      // Then
      expect(service['getFederation']).toHaveBeenCalledTimes(2);
      expect(service['getFederation']).toHaveBeenNthCalledWith(
        1,
        sessionDataMock.spId,
        subSpMock,
        entityIdMock,
      );
    });

    it('should call getFederation to get idpFederation', async () => {
      // Given
      service['getFederation'] = jest.fn();
      accountServiceMock.storeInteraction.mockResolvedValue('saved');
      // When
      await service.computeInteraction(computeSp, computeIdp);
      // Then
      expect(service['getFederation']).toHaveBeenCalledTimes(2);
      expect(service['getFederation']).toHaveBeenNthCalledWith(
        2,
        sessionDataMock.idpId,
        subIdpMock,
      );
    });

    it('should call storeInteraction with interaction object well formatted', async () => {
      // Given
      service['getFederation'] = jest
        .fn()
        .mockReturnValueOnce({ myEntityId: { sub: subSpMock } })
        .mockReturnValueOnce({ [sessionDataMock.idpId]: { sub: subIdpMock } });
      // When
      await service.computeInteraction(computeSp, computeIdp);

      // Then
      expect(accountServiceMock.storeInteraction).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.storeInteraction).toHaveBeenCalledWith({
        identityHash: rnippidentityHashMock,
        idpFederation: { [sessionDataMock.idpId]: { sub: subIdpMock } },
        spFederation: { myEntityId: { sub: subSpMock } },
        lastConnection: expect.any(Date),
      });
    });

    it('should call storeInteraction with interaction object well formatted', async () => {
      // Given
      service['getFederation'] = jest
        .fn()
        .mockReturnValueOnce({ myEntityId: { sub: subSpMock } })
        .mockReturnValueOnce({ [sessionDataMock.idpId]: { sub: subIdpMock } });
      accountServiceMock.storeInteraction.mockRejectedValueOnce('fail!!!');
      // When
      try {
        await service.computeInteraction(computeSp, computeIdp);
      } catch (e) {
        expect(loggerServiceMock.warn).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('overrideAuthorizePrompt', () => {
    it('should set prompt parameter on query', () => {
      // Given
      const ctxMock = {
        method: 'GET',
        query: {},
      } as OidcCtx;
      const overridePrompt = 'test';
      // When
      service['overrideAuthorizePrompt'](overridePrompt, ctxMock);
      // Then
      expect(ctxMock.query.prompt).toBe(overridePrompt);
      expect(ctxMock.body).toBeUndefined();
    });
    it('should set prompt parameter on body', () => {
      // Given
      const ctxMock = ({
        method: 'POST',
        req: { body: {} },
      } as unknown) as OidcCtx;
      const overridePrompt = 'test';
      // When
      service['overrideAuthorizePrompt'](overridePrompt, ctxMock);
      // Then
      expect(ctxMock.req['body'].prompt).toBe(overridePrompt);
      expect(ctxMock.query).toBeUndefined();
    });
    it('should not do anything but log if there is no method declared', () => {
      // Given
      const ctxMock = {} as OidcCtx;
      const overridePrompt = 'test';
      // When
      service['overrideAuthorizePrompt'](overridePrompt, ctxMock);
      // Then
      expect(ctxMock).toEqual({});
      expect(loggerServiceMock.warn).toHaveBeenCalledTimes(1);
    });
    it('should not do anything but log if method is not handled', () => {
      // Given
      const ctxMock = { method: 'DELETE' } as OidcCtx;
      const overridePrompt = 'test';
      // When
      service['overrideAuthorizePrompt'](overridePrompt, ctxMock);
      // Then
      expect(ctxMock).toEqual({ method: 'DELETE' });
      expect(loggerServiceMock.warn).toHaveBeenCalledTimes(1);
    });
  });

  describe('overrideAuthorizeAcrValues', () => {
    const allowedAcrMock = ['boots', 'clothes', 'motorcycle'];
    it('should set acr values parameter on query', () => {
      // Given
      const overrideAcr = 'boots';
      const ctxMock = {
        method: 'GET',
        // Oidc Naming convention
        // eslint-disable-next-line @typescript-eslint/naming-convention
        query: { acr_values: 'Boots' },
      } as OidcCtx;

      // When
      service['overrideAuthorizeAcrValues'](allowedAcrMock, ctxMock);
      // Then
      expect(ctxMock.query.acr_values).toBe(overrideAcr);
      expect(ctxMock.body).toBeUndefined();
    });
    it('should set acr values parameter on body', () => {
      // Given
      const overrideAcr = 'boots';
      const ctxMock = ({
        method: 'POST',
        // Oidc Naming convention
        // eslint-disable-next-line @typescript-eslint/naming-convention
        req: { body: { acr_values: 'Boots' } },
      } as unknown) as OidcCtx;
      // When
      service['overrideAuthorizeAcrValues'](allowedAcrMock, ctxMock);
      // Then
      expect(ctxMock.req['body'].acr_values).toBe(overrideAcr);
      expect(ctxMock.query).toBeUndefined();
    });
    it('should not do anything but log if there is no method declared', () => {
      // Given
      const ctxMock = {} as OidcCtx;
      // When
      service['overrideAuthorizeAcrValues'](allowedAcrMock, ctxMock);
      // Then
      expect(ctxMock).toEqual({});
      expect(loggerServiceMock.warn).toHaveBeenCalledTimes(1);
    });
    it('should not do anything but log if method is not handled', () => {
      // Given
      const ctxMock = { method: 'DELETE' } as OidcCtx;
      // When
      service['overrideAuthorizeAcrValues'](allowedAcrMock, ctxMock);
      // Then
      expect(ctxMock).toEqual({ method: 'DELETE' });
      expect(loggerServiceMock.warn).toHaveBeenCalledTimes(1);
    });
  });

  describe('checkIfAccountIsBlocked', () => {
    it('Should go through check if account is not blocked', async () => {
      // Given
      const identityHash = 'hashedIdentity';
      // Then
      await service.checkIfAccountIsBlocked(identityHash);

      expect(accountServiceMock.isBlocked).toBeCalledTimes(1);
    });
    it('Should throw if account is blocked', async () => {
      // Given
      accountServiceMock.isBlocked.mockResolvedValue(true);
      const identityHash = 'hashedIdentity';
      // Then
      await expect(
        service.checkIfAccountIsBlocked(identityHash),
      ).rejects.toThrow(AccountBlockedException);

      expect(accountServiceMock.isBlocked).toBeCalledTimes(1);
    });

    it('Should throw if account blocked check fails', async () => {
      // Given
      const error = new Error('foo');
      accountServiceMock.isBlocked.mockRejectedValueOnce(error);
      const identityHash = 'hashedIdentity';
      // Then
      await expect(
        service.checkIfAccountIsBlocked(identityHash),
      ).rejects.toThrow(error);

      expect(accountServiceMock.isBlocked).toBeCalledTimes(1);
    });
  });

  describe('checkIfAcrIsValid', () => {
    it('should throw if received is not valid', () => {
      // Given
      const received = 'someInvalidString';
      const requested = 'eidas2';
      // When
      const call = () => service['checkIfAcrIsValid'](received, requested);
      // Then
      expect(call).toThrow(CoreInvalidAcrException);
    });
    it('should throw if requested is not valid', () => {
      // Given
      const received = 'eidas3';
      const requested = 'someInvalidString';
      // When
      const call = () => service['checkIfAcrIsValid'](received, requested);
      // Then
      expect(call).toThrow(CoreInvalidAcrException);
    });

    it('should throw if requested is empty', () => {
      // Given
      const received = 'eidas3';
      const requested = '';
      // When
      const call = () => service['checkIfAcrIsValid'](received, requested);
      // Then
      expect(call).toThrow(CoreInvalidAcrException);
    });
    it('should throw if received is empty', () => {
      // Given
      const received = '';
      const requested = 'eidas2';
      // When
      const call = () => service['checkIfAcrIsValid'](received, requested);
      // Then
      expect(call).toThrow(CoreInvalidAcrException);
    });

    it('should throw if requested is undefined', () => {
      // Given
      const received = 'eidas3';
      const requested = undefined;
      // When
      const call = () => service['checkIfAcrIsValid'](received, requested);
      // Then
      expect(call).toThrow(CoreInvalidAcrException);
    });
    it('should throw if received is undefined', () => {
      // Given
      const received = undefined;
      const requested = 'eidas2';
      // When
      const call = () => service['checkIfAcrIsValid'](received, requested);
      // Then
      expect(call).toThrow(CoreInvalidAcrException);
    });

    it('should throw if requested is null', () => {
      // Given
      const received = 'eidas3';
      const requested = null;
      // When
      const call = () => service['checkIfAcrIsValid'](received, requested);
      // Then
      expect(call).toThrow(CoreInvalidAcrException);
    });
    it('should throw if received is null', () => {
      // Given
      const received = null;
      const requested = 'eidas2';
      // When
      const call = () => service['checkIfAcrIsValid'](received, requested);
      // Then
      expect(call).toThrow(CoreInvalidAcrException);
    });

    it('should throw if received is lower than requested (1 vs 2)', () => {
      // Given
      const received = 'eidas1';
      const requested = 'eidas2';
      // When
      const call = () => service['checkIfAcrIsValid'](received, requested);
      // Then
      expect(call).toThrow(CoreLowAcrException);
    });

    it('should throw if received is lower than requested (2 vs 3)', () => {
      // Given
      const received = 'eidas2';
      const requested = 'eidas3';
      // When
      const call = () => service['checkIfAcrIsValid'](received, requested);
      // Then
      expect(call).toThrow(CoreLowAcrException);
    });

    it('should not throw if received is equal to requested for level eidas1', () => {
      // Given
      const received = 'eidas1';
      const requested = 'eidas1';
      // When
      const call = () => service['checkIfAcrIsValid'](received, requested);
      // Then
      expect(call).not.toThrow();
    });
    it('should not throw if received is equal to requested for level eidas2', () => {
      // Given
      const received = 'eidas2';
      const requested = 'eidas2';
      // When
      const call = () => service['checkIfAcrIsValid'](received, requested);
      // Then
      expect(call).not.toThrow();
    });
    it('should not throw if received is equal to requested for level eidas3', () => {
      // Given
      const received = 'eidas3';
      const requested = 'eidas3';
      // When
      const call = () => service['checkIfAcrIsValid'](received, requested);
      // Then
      expect(call).not.toThrow();
    });

    it('should not throw if received is higher then requested (2 vs 1)', () => {
      // Given
      const received = 'eidas2';
      const requested = 'eidas1';
      // When
      const call = () => service['checkIfAcrIsValid'](received, requested);
      // Then
      expect(call).not.toThrow();
    });
    it('should not throw if received is higher then requested (3 vs 2)', () => {
      // Given
      const received = 'eidas3';
      const requested = 'eidas2';
      // When
      const call = () => service['checkIfAcrIsValid'](received, requested);
      // Then
      expect(call).not.toThrow();
    });
  });
});
