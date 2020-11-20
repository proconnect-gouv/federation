import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { ConfigService } from '@fc/config';
import { OidcProviderService, OidcCtx } from '@fc/oidc-provider';
import { SessionService } from '@fc/session';
import { CryptographyService } from '@fc/cryptography';
import { AccountService, AccountBlockedException } from '@fc/account';
import { TrackingService } from '@fc/tracking';
import { IOidcIdentity } from '@fc/oidc';
import { CoreLowAcrException, CoreInvalidAcrException } from '../exceptions';
import { CoreService } from './core.service';

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

  const cryptographyServiceMock = {
    computeIdentityHash: jest.fn(),
    computeSubV2: jest.fn(),
  };

  const configServiceMock = {
    get: jest.fn(),
  };

  const trackingMock = {
    track: jest.fn(),
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
        CoreService,
        LoggerService,
        ConfigService,
        OidcProviderService,
        SessionService,
        CryptographyService,
        AccountService,
        TrackingService,
      ],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(OidcProviderService)
      .useValue(oidcProviderServiceMock)
      .overrideProvider(SessionService)
      .useValue(sessionServiceMock)
      .overrideProvider(CryptographyService)
      .useValue(cryptographyServiceMock)
      .overrideProvider(AccountService)
      .useValue(accountServiceMock)
      .overrideProvider(TrackingService)
      .useValue(trackingMock)
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

  describe('buildInteractionParts', () => {
    // Given
    const hash = 'hashMock';
    const sub = 'subMock';
    const id = 'idpIdMock';
    const identity = ({} as unknown) as IOidcIdentity;

    it('should call cryptography.computeIdentityHash', () => {
      // When
      service['buildInteractionParts'](id, identity);
      // Then
      expect(cryptographyServiceMock.computeIdentityHash).toHaveBeenCalledTimes(
        1,
      );
      expect(cryptographyServiceMock.computeIdentityHash).toHaveBeenCalledWith(
        identity,
      );
    });

    it('should call cryptography.computeSubV2', () => {
      // Given
      cryptographyServiceMock.computeIdentityHash.mockReturnValue(hash);
      // When
      service['buildInteractionParts'](id, identity);
      // Then
      expect(cryptographyServiceMock.computeSubV2).toHaveBeenCalledTimes(1);
      expect(cryptographyServiceMock.computeSubV2).toHaveBeenCalledWith(
        hash,
        id,
      );
    });

    it('should return an object containing hash, sub and federation', () => {
      // Given
      cryptographyServiceMock.computeIdentityHash.mockReturnValue(hash);
      cryptographyServiceMock.computeSubV2.mockReturnValue(sub);
      // When
      const result = service['buildInteractionParts'](id, identity);
      // Then
      expect(result).toEqual({
        hash,
        sub,
        federation: { idpIdMock: { sub } },
      });
    });
  });

  describe('storeInteraction', () => {
    // Given
    const idpId = 'idpIdMock';
    const idpIdentity = ({} as unknown) as IOidcIdentity;
    const spId = 'spIdMock';
    const spIdentity = ({} as unknown) as IOidcIdentity;

    const hash = 'hashMock';
    const spFederation = 'spFederation';
    const idpFederation = 'idpFederation';

    const spInteraction = {
      hash,
      federation: spFederation,
    };
    const idpInteraction = {
      hash,
      federation: idpFederation,
    };
    const buildInteractionPartsMock = jest.fn();

    beforeEach(() => {
      buildInteractionPartsMock.mockReturnValueOnce(spInteraction);
      buildInteractionPartsMock.mockReturnValueOnce(idpInteraction);

      service['buildInteractionParts'] = buildInteractionPartsMock;
    });

    it('should call buildInteractionParts twice', async () => {
      // When
      await service.storeInteraction(idpId, idpIdentity, spId, spIdentity);
      // Then
      expect(service['buildInteractionParts']).toHaveBeenCalledTimes(2);
      expect(service['buildInteractionParts']).toHaveBeenCalledWith(
        spId,
        spIdentity,
      );
      expect(service['buildInteractionParts']).toHaveBeenCalledWith(
        idpId,
        idpIdentity,
      );
    });

    it('should call account.storeInteraction', async () => {
      // When
      await service.storeInteraction(idpId, idpIdentity, spId, spIdentity);
      // Then
      expect(accountServiceMock.storeInteraction).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.storeInteraction).toHaveBeenCalledWith(
        expect.objectContaining({
          identityHash: hash,
          idpFederation,
          spFederation,
          lastConnection: expect.any(Date),
        }),
      );
    });

    it('should return interaction parts', async () => {
      // When
      const result = await service.storeInteraction(
        idpId,
        idpIdentity,
        spId,
        spIdentity,
      );
      // Then
      expect(result).toEqual({
        spInteraction,
        idpInteraction,
      });
    });

    it('should not throw if interaction storage fails', async () => {
      // Given
      const error = new Error();
      accountServiceMock.storeInteraction.mockRejectedValue(error);
      // Then
      await expect(
        service.storeInteraction(idpId, idpIdentity, spId, spIdentity),
      ).resolves.not.toThrow();
    });

    it('should log a warning interaction storage fails', async () => {
      // Given
      const error = new Error();
      accountServiceMock.storeInteraction.mockRejectedValue(error);
      // When
      await service.storeInteraction(idpId, idpIdentity, spId, spIdentity);
      // Then
      expect(loggerServiceMock.warn).toHaveBeenCalledTimes(1);
      expect(loggerServiceMock.warn).toHaveBeenCalledWith(
        'Could not persist interaction to database',
      );
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
      const identityMock = {};
      // Then
      await service['checkIfAccountIsBlocked'](identityMock);

      expect(accountServiceMock.isBlocked).toBeCalledTimes(1);
    });
    it('Should throw if account is blocked', async () => {
      // Given
      accountServiceMock.isBlocked.mockResolvedValue(true);
      const identityMock = {};
      // Then
      await expect(
        service['checkIfAccountIsBlocked'](identityMock),
      ).rejects.toThrow(AccountBlockedException);

      expect(accountServiceMock.isBlocked).toBeCalledTimes(1);
    });

    it('Should throw if account blocked check fails', async () => {
      // Given
      const error = new Error('foo');
      accountServiceMock.isBlocked.mockRejectedValueOnce(error);
      const identityMock = {};
      // Then
      await expect(
        service['checkIfAccountIsBlocked'](identityMock),
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
