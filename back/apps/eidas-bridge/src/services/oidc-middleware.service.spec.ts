import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { OidcProviderService } from '@fc/oidc-provider';
import { ServiceProviderEnvService } from '@fc/service-provider-env';
import { SessionService } from '@fc/session';
import { OidcMiddlewareService } from './oidc-middleware.service';

describe('MockIdentityProviderFcaService', () => {
  let service: OidcMiddlewareService;

  const loggerMock = {
    debug: jest.fn(),
    fatal: jest.fn(),
    setContext: jest.fn(),
  };

  const sessionServiceMock = {
    get: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    init: jest.fn(),
  };

  const serviceProviderEnvServiceMock = {
    getList: jest.fn(),
    getById: jest.fn(),
  };

  const getInteractionMock = jest.fn();

  const oidcProviderServiceMock = {
    getInteraction: getInteractionMock,
    registerMiddleware: jest.fn(),
    getInteractionIdFromCtx: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggerService,
        OidcProviderService,
        OidcMiddlewareService,
        ServiceProviderEnvService,
        SessionService,
      ],
    })
      .overrideProvider(OidcProviderService)
      .useValue(oidcProviderServiceMock)
      .overrideProvider(ServiceProviderEnvService)
      .useValue(serviceProviderEnvServiceMock)
      .overrideProvider(SessionService)
      .useValue(sessionServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .compile();

    service = module.get<OidcMiddlewareService>(OidcMiddlewareService);

    jest.resetAllMocks();
  });

  describe('onModuleInit', () => {
    it('should call loadDatabase', () => {
      // When
      service.onModuleInit();
      // Then
      expect(oidcProviderServiceMock.registerMiddleware).toHaveBeenCalledTimes(
        1,
      );
    });
  });

  describe('authorizationMiddleware', () => {
    const getCtxMock = (hasError = false) => {
      return {
        req: {
          headers: { 'x-forwarded-for': '123.123.123.123' },
        },
        oidc: {
          isError: hasError,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          params: { client_id: 'foo', acr_values: 'eidas3' },
        },
        res: {},
      };
    };
    it('should abort middleware execution if request if flagged as erroring', () => {
      // Given
      const ctxMock = getCtxMock(true);
      service['getInteractionIdFromCtx'] = jest.fn();

      // When
      service['authorizationMiddleware'](ctxMock);

      // Then
      expect(service['getInteractionIdFromCtx']).toHaveBeenCalledTimes(0);
      expect(serviceProviderEnvServiceMock.getById).toHaveBeenCalledTimes(0);
      expect(sessionServiceMock.init).toHaveBeenCalledTimes(0);
    });

    it('should call session.init', async () => {
      // Given
      const ctxMock = getCtxMock();
      oidcProviderServiceMock.getInteractionIdFromCtx = jest
        .fn()
        .mockReturnValue('42');
      serviceProviderEnvServiceMock.getById.mockReturnValueOnce({
        name: 'my SP',
      });
      sessionServiceMock.init.mockResolvedValueOnce(undefined);

      // When
      await service['authorizationMiddleware'](ctxMock);

      // Then
      expect(sessionServiceMock.init).toHaveBeenCalledTimes(1);
      expect(sessionServiceMock.init).toHaveBeenCalledWith(ctxMock.res, '42', {
        spId: 'foo',
        spAcr: 'eidas3',
        spName: 'my SP',
      });
    });

    it('should throw if the session initialization fails', async () => {
      // Given
      const ctxMock = getCtxMock();
      service['getInteractionIdFromCtx'] = jest.fn().mockReturnValue('42');
      sessionServiceMock.init.mockRejectedValueOnce(new Error('test'));

      // Then
      await expect(
        service['authorizationMiddleware'](ctxMock),
      ).rejects.toThrow();
    });
  });
});
