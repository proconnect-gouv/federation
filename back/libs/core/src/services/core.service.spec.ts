import {
  OidcProviderMiddlewareStep,
  OidcProviderRoutes,
} from '@fc/oidc-provider';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { ConfigService } from '@fc/config';
import {
  OidcProviderService,
  OidcCtx,
  OidcProviderAuthorizationEvent,
  OidcProviderTokenEvent,
  OidcProviderUserinfoEvent,
} from '@fc/oidc-provider';
import { ISessionBoundContext, SessionService } from '@fc/session';
import { OidcSession } from '@fc/oidc';
import { CryptographyFcpService } from '@fc/cryptography-fcp';
import { AccountService, AccountBlockedException } from '@fc/account';
import { OidcProviderErrorService } from '@fc/oidc-provider/services/oidc-provider-error.service';
import { ServiceProviderAdapterMongoService } from '@fc/service-provider-adapter-mongo';
import { IEventContext, TrackingService } from '@fc/tracking';
import { CoreLowAcrException, CoreInvalidAcrException } from '../exceptions';
import { CoreService } from './core.service';
import { ComputeSp, ComputeIdp } from '../types';

describe('CoreService', () => {
  let service: CoreService;

  const loggerServiceMock = {
    setContext: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
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
    getInteractionIdFromCtx: jest.fn(),
  };

  const oidcProviderErrorServiceMock = {
    throwError: jest.fn(),
  };

  const sessionServiceMock = {
    get: jest.fn(),
    set: jest.fn(),
    reset: jest.fn(),
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

  const sessionDataMock: OidcSession = {
    idpId: '42',
    idpAcr: 'eidas3',
    idpName: 'my favorite Idp',
    idpIdentity: idpIdentityMock,
    spId: 'sp_id',
    spAcr: 'eidas3',
    spName: 'my great SP',
    spIdentity: spIdentityMock,
  };

  const interactionIdValueMock = '42';
  const sessionIdMockValue = '42';
  const cookieMaxAgeValueMock = 42;
  const entityIdMock = 'myEntityId';
  const subSpMock = 'MockedSpSub';
  const rnippidentityHashMock = 'rnippIdentityHashed';
  const subIdpMock = 'MockedIdpSub';
  const spNameMock = 'my SP';

  const trackingMock = {
    track: jest.fn(),
  };

  const serviceProviderServiceMock = {
    getList: jest.fn(),
    getById: jest.fn(),
  };

  const configurationMock = {
    routes: { authorization: '/foo' },
    cookies: {
      long: {
        maxAge: cookieMaxAgeValueMock,
      },
    },
  };

  const unknownError = new Error('Unknown Error');

  beforeEach(async () => {
    /**
     * @TODO #258
     * ETQ Dev, je "clear" également les mocks au lieu de seulement les "reset"
     * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/258
     */
    jest.clearAllMocks();
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoreService,
        LoggerService,
        ConfigService,
        OidcProviderService,
        OidcProviderErrorService,
        CryptographyFcpService,
        AccountService,
        ServiceProviderAdapterMongoService,
        SessionService,
        TrackingService,
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
      .overrideProvider(OidcProviderErrorService)
      .useValue(oidcProviderErrorServiceMock)
      .overrideProvider(AccountService)
      .useValue(accountServiceMock)
      .overrideProvider(ServiceProviderAdapterMongoService)
      .useValue(serviceProviderServiceMock)
      .overrideProvider(SessionService)
      .useValue(sessionServiceMock)
      .overrideProvider(TrackingService)
      .useValue(trackingMock)
      .compile();

    configServiceMock.get.mockReturnValue({
      forcedPrompt: ['testprompt'],
      configuration: configurationMock,
      // OidcProvider.configuration
      acrValues: ['Boots', 'Motorcycles', 'Glasses'],
    });

    service = module.get<CoreService>(CoreService);

    getInteractionMock.mockResolvedValue(getInteractionResultMock);
    sessionServiceMock.get.mockResolvedValue(sessionDataMock);
    sessionServiceMock.reset.mockResolvedValue(sessionIdMockValue);
    accountServiceMock.isBlocked.mockResolvedValue(false);

    const serviceProviderListMock = [{ name: spNameMock }];

    serviceProviderServiceMock.getById.mockResolvedValue(
      serviceProviderListMock[0],
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit()', () => {
    it('should register ovrrideAuthorizePrompt middleware', () => {
      // Given
      service['registerMiddlewares'] = jest.fn();
      // When
      service.onModuleInit();
      // Then
      expect(service['registerMiddlewares']).toHaveBeenCalledTimes(1);
    });
  });

  describe('getFederation()', () => {
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

  describe('computeInteraction()', () => {
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

  describe('overrideAuthorizePrompt()', () => {
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
      const ctxMock: OidcCtx = {
        method: 'POST',
        req: { body: {} },
      } as unknown as OidcCtx;
      const overridePrompt = 'test';
      // When
      service['overrideAuthorizePrompt'](overridePrompt, ctxMock);
      // Then
      expect(ctxMock.req.body.prompt).toBe(overridePrompt);
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

  describe('overrideAuthorizeAcrValues()', () => {
    const defaultAcrMock = 'eidas3';
    const allowedAcrMock = ['boots', 'clothes', 'motorcycle'];

    it('should set acr values parameter on query', () => {
      // Given
      const overrideAcr = 'boots';
      const ctxMock = {
        method: 'GET',
        // Oidc Naming convention
        // eslint-disable-next-line @typescript-eslint/naming-convention
        query: { acr_values: 'boots' },
      } as unknown as OidcCtx;

      // When
      service['overrideAuthorizeAcrValues'](
        allowedAcrMock,
        defaultAcrMock,
        ctxMock,
      );
      // Then
      expect(ctxMock.query.acr_values).toBe(overrideAcr);
      expect(ctxMock.body).toBeUndefined();
    });

    it('should set acr values parameter on body', () => {
      // Given
      const overrideAcr = 'boots';
      const ctxMock = {
        method: 'POST',
        // Oidc Naming convention
        // eslint-disable-next-line @typescript-eslint/naming-convention
        req: { body: { acr_values: 'boots' } },
      } as unknown as OidcCtx;
      // When
      service['overrideAuthorizeAcrValues'](
        allowedAcrMock,
        defaultAcrMock,
        ctxMock,
      );
      // Then
      expect(ctxMock.req.body.acr_values).toBe(overrideAcr);
      expect(ctxMock.query).toBeUndefined();
    });

    it('should not do anything but log if there is no method declared', () => {
      // Given
      const ctxMock = {} as OidcCtx;
      // When
      service['overrideAuthorizeAcrValues'](
        allowedAcrMock,
        defaultAcrMock,
        ctxMock,
      );
      // Then
      expect(ctxMock).toEqual({});
      expect(loggerServiceMock.warn).toHaveBeenCalledTimes(1);
    });

    it('should not do anything but log if method is not handled', () => {
      // Given
      const ctxMock = { method: 'DELETE' } as OidcCtx;
      // When
      service['overrideAuthorizeAcrValues'](
        allowedAcrMock,
        defaultAcrMock,
        ctxMock,
      );
      // Then
      expect(ctxMock).toEqual({ method: 'DELETE' });
      expect(loggerServiceMock.warn).toHaveBeenCalledTimes(1);
    });
  });

  describe('checkIfAccountIsBlocked()', () => {
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

  describe('checkIfAcrIsValid()', () => {
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

  describe('registerMiddlewares()', () => {
    it('should call registerMiddleware from oidcProvider', () => {
      // Given
      oidcProviderServiceMock.registerMiddleware = jest.fn();
      // When
      service['registerMiddlewares']();
      // Then
      expect(oidcProviderServiceMock.registerMiddleware).toHaveBeenCalledTimes(
        5,
      );
    });

    it('should register 5 events', () => {
      // Given
      service['overrideAuthorizePrompt'] = jest.fn();
      service['overrideAuthorizeAcrValues'] = jest.fn();
      service['authorizationMiddleware'] = jest.fn();
      service['tokenMiddleware'] = jest.fn();
      service['userinfoMiddleware'] = jest.fn();
      // When
      service['registerMiddlewares']();
      // Then
      expect(oidcProviderServiceMock.registerMiddleware).toHaveBeenCalledWith(
        OidcProviderMiddlewareStep.BEFORE,
        OidcProviderRoutes.AUTHORIZATION,
        expect.any(Function),
      );

      expect(oidcProviderServiceMock.registerMiddleware).toHaveBeenCalledWith(
        OidcProviderMiddlewareStep.AFTER,
        OidcProviderRoutes.AUTHORIZATION,
        expect.any(Function),
      );

      expect(oidcProviderServiceMock.registerMiddleware).toHaveBeenCalledWith(
        OidcProviderMiddlewareStep.AFTER,
        OidcProviderRoutes.TOKEN,
        expect.any(Function),
      );

      expect(oidcProviderServiceMock.registerMiddleware).toHaveBeenCalledWith(
        OidcProviderMiddlewareStep.AFTER,
        OidcProviderRoutes.USERINFO,
        expect.any(Function),
      );
    });
  });

  describe('authorizationMiddleware()', () => {
    const spIdMock = 'spIdValue';
    const spAcrMock = 'eidas3';
    const reqMock = {
      sessionId: sessionIdMockValue,
      headers: { 'x-forwarded-for': '123.123.123.123' },
    };
    const resMock = {};

    const getCtxMock = (hasError = false) => {
      return {
        req: reqMock,
        res: resMock,
        oidc: {
          isError: hasError,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          params: { client_id: spIdMock, acr_values: spAcrMock },
        },
      };
    };

    const eventCtxMock: IEventContext = {
      fc: {
        interactionId: interactionIdValueMock,
      },
      headers: {
        'x-forwarded-for': '123.123.123.123',
      },
    };

    it('should abort middleware execution if the request is flagged with an error', () => {
      // Given
      const ctxMock = getCtxMock(true);
      service['getEventContext'] = jest.fn();

      // When
      service['authorizationMiddleware'](ctxMock);

      // Then
      expect(service['getEventContext']).toHaveBeenCalledTimes(0);
      expect(serviceProviderServiceMock.getById).toHaveBeenCalledTimes(0);
      expect(sessionServiceMock.set).toHaveBeenCalledTimes(0);
      expect(trackingMock.track).toHaveBeenCalledTimes(0);
    });

    it('should call session.reset()', async () => {
      // Given
      const ctxMock = getCtxMock();

      service['getEventContext'] = jest.fn().mockReturnValueOnce(eventCtxMock);

      // When
      await service['authorizationMiddleware'](ctxMock);

      // Then
      expect(sessionServiceMock.reset).toHaveBeenCalledTimes(1);
      expect(sessionServiceMock.reset).toHaveBeenCalledWith(reqMock, resMock);
    });

    it('should call session.set()', async () => {
      // Given
      const ctxMock = getCtxMock();

      service['getEventContext'] = jest.fn().mockReturnValueOnce(eventCtxMock);

      const boundSessionContextMock: ISessionBoundContext = {
        sessionId: sessionIdMockValue,
        moduleName: 'OidcClient',
      };

      const sessionPropertiesMock = {
        interactionId: interactionIdValueMock,
        spId: spIdMock,
        spAcr: spAcrMock,
        spName: spNameMock,
      };

      // When
      await service['authorizationMiddleware'](ctxMock);

      // Then
      expect(sessionServiceMock.set).toHaveBeenCalledTimes(1);
      expect(sessionServiceMock.set).toHaveBeenCalledWith(
        boundSessionContextMock,
        sessionPropertiesMock,
      );
    });

    it('should throw if the session initialization fails', async () => {
      // Given
      const ctxMock = getCtxMock();
      service['getInteractionIdFromCtx'] = jest
        .fn()
        .mockReturnValue(interactionIdValueMock);
      service['bindFunctionMock'] =
        sessionServiceMock.set.mockRejectedValueOnce(new Error('test'));

      // Then
      await expect(
        service['authorizationMiddleware'](ctxMock),
      ).rejects.toThrow();
    });

    it('should call publish authorization event', async () => {
      // Given
      const ctxMock = getCtxMock();
      service['getInteractionIdFromCtx'] = jest
        .fn()
        .mockReturnValue(sessionDataMock.idpId);

      service['getEventContext'] = jest
        .fn()
        .mockReturnValue(eventCtxMock as IEventContext);

      service['serviceProvider'].getById = jest
        .fn()
        .mockResolvedValue({ name: spNameMock });

      const authEventContextMock: IEventContext = {
        ...eventCtxMock,
        spId: spIdMock,
        spAcr: spAcrMock,
        spName: spNameMock,
      };
      // When
      await service['authorizationMiddleware'](ctxMock);

      // Then
      expect(service['serviceProvider'].getById).toHaveBeenCalledTimes(1);
      expect(service['serviceProvider'].getById).toHaveBeenCalledWith(spIdMock);

      expect(service['tracking'].track).toHaveBeenCalledTimes(1);
      expect(service['tracking'].track).toHaveBeenCalledWith(
        OidcProviderAuthorizationEvent,
        authEventContextMock,
      );
    });
  });

  describe('tokenMiddleware()', () => {
    it('should publish a token event', async () => {
      // Given
      const eventCtxMock: IEventContext = {
        fc: { interactionId: interactionIdValueMock },
        headers: { 'x-forwarded-for': '123.123.123.123' },
      };
      const ctxMock = {
        req: {
          headers: { 'x-forwarded-for': '123.123.123.123' },
          // oidc
          // eslint-disable-next-line @typescript-eslint/naming-convention
          query: { client_id: 'foo', acr_values: 'eidas3' },
        },
        res: {},
      };

      service['getEventContext'] = jest
        .fn()
        .mockReturnValue(eventCtxMock as IEventContext);

      serviceProviderServiceMock.getById.mockResolvedValueOnce({
        name: 'name',
      });
      // When
      service['tokenMiddleware'](ctxMock);
      // Then
      expect(trackingMock.track).toHaveBeenCalledTimes(1);
      expect(service['getEventContext']).toHaveBeenCalledTimes(1);
      expect(service['getEventContext']).toHaveBeenLastCalledWith(ctxMock);
      expect(trackingMock.track).toHaveBeenCalledWith(
        OidcProviderTokenEvent,
        eventCtxMock,
      );
    });

    it('should call throwError if getEventContext failed', async () => {
      // Given
      const ctxMock: any = {
        not: 'altered',
        req: { headers: { 'x-forwarded-for': '123.123.123.123' } },
      };

      const errorMock = new Error('unknowError');

      service['getEventContext'] = jest.fn().mockImplementationOnce(() => {
        throw errorMock;
      });

      // When
      await service['tokenMiddleware'](ctxMock);
      // Then
      expect(service['getEventContext']).toHaveBeenNthCalledWith(1, ctxMock);
      expect(oidcProviderErrorServiceMock.throwError).toHaveBeenNthCalledWith(
        1,
        ctxMock,
        errorMock,
      );
    });

    it('should call throwError if tracking.track throw an error', async () => {
      // Given
      const ctxMock: any = {
        not: 'altered',
        req: { headers: { 'x-forwarded-for': '123.123.123.123' } },
      };

      trackingMock.track.mockImplementationOnce(() => {
        throw unknownError;
      });
      service['oidcErrorService']['throwError'] = jest.fn();
      // When
      await service['tokenMiddleware'](ctxMock);
      // Then
      expect(service['oidcErrorService']['throwError']).toHaveBeenCalledTimes(
        1,
      );
      expect(service['oidcErrorService']['throwError']).toHaveBeenCalledWith(
        ctxMock,
        expect.any(Error),
      );
    });
  });

  describe('userinfoMiddleware()', () => {
    it('should publish a token event', () => {
      // Given
      const ctxMock = {
        req: {
          headers: { 'x-forwarded-for': '123.123.123.123' },
          // oidc
          // eslint-disable-next-line @typescript-eslint/naming-convention
          query: { client_id: 'foo', acr_values: 'eidas3' },
        },
        res: {},
      };
      service['getEventContext'] = jest.fn().mockReturnValueOnce({
        fc: {
          interactionId: '42',
        },
        headers: {
          'x-forwarded-for': '123.123.123.123',
        },
      });
      // When
      service['userinfoMiddleware'](ctxMock);
      // Then
      expect(trackingMock.track).toHaveBeenCalledTimes(1);
      expect(trackingMock.track).toHaveBeenCalledWith(
        OidcProviderUserinfoEvent,
        expect.any(Object),
      );
    });

    it('should call throwError if getEventContext fail', () => {
      // Given
      const ctxMock: any = {
        not: 'altered',
        req: { headers: { 'x-forwarded-for': '123.123.123.123' } },
      };

      const errorMock = new Error('unknowError');

      service['getEventContext'] = jest.fn().mockImplementationOnce(() => {
        throw errorMock;
      });
      // When
      service['userinfoMiddleware'](ctxMock);
      // Then
      expect(service['getEventContext']).toHaveBeenCalledTimes(1);
      expect(service['oidcErrorService']['throwError']).toHaveBeenNthCalledWith(
        1,
        ctxMock,
        errorMock,
      );
    });

    it('should call throwError if tracking.track throw an error', () => {
      // Given
      const ctxMock: any = {
        not: 'altered',
        req: { headers: { 'x-forwarded-for': '123.123.123.123' } },
      };

      service['getEventContext'] = jest.fn();

      const errorMock = new Error('Unknown Error');

      trackingMock.track.mockImplementationOnce(() => {
        throw errorMock;
      });
      // When
      service['userinfoMiddleware'](ctxMock);
      // Then
      expect(service['getEventContext']).toHaveBeenCalledTimes(1);
      expect(service['oidcErrorService']['throwError']).toHaveBeenNthCalledWith(
        1,
        ctxMock,
        errorMock,
      );
    });
  });
});
