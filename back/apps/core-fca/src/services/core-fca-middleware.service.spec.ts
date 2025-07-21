import { validate } from 'class-validator';

import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@fc/config';
import { CoreNoSessionIdException } from '@fc/core-fca/exceptions';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { LoggerService } from '@fc/logger';
import { OidcCtx, OidcProviderService } from '@fc/oidc-provider';
import { ServiceProviderAdapterMongoService } from '@fc/service-provider-adapter-mongo';
import { SessionService } from '@fc/session';
import { TrackingService } from '@fc/tracking';

import { getLoggerMock } from '@mocks/logger';
import { getSessionServiceMock } from '@mocks/session';

import { CoreFcaMiddlewareService } from './core-fca-middleware.service';

jest.mock('class-validator', () => ({
  ...jest.requireActual('class-validator'),
  validate: jest.fn(),
}));
jest.mock('@fc/exceptions/helpers', () => ({
  ...jest.requireActual('@fc/exceptions/helpers'),
  throwException: jest.fn(),
}));

describe('CoreFcaMiddlewareService', () => {
  let service: CoreFcaMiddlewareService;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockOidcProviderService: jest.Mocked<OidcProviderService>;
  let mockSessionService: jest.Mocked<SessionService>;
  let mockTrackingService: jest.Mocked<TrackingService>;
  let validateMock: jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoreFcaMiddlewareService,
        { provide: LoggerService, useValue: getLoggerMock() },
        { provide: ConfigService, useValue: { get: jest.fn() } },
        {
          provide: OidcProviderService,
          useValue: { registerMiddleware: jest.fn(), clearCookies: jest.fn() },
        },
        { provide: SessionService, useValue: getSessionServiceMock() },
        { provide: ServiceProviderAdapterMongoService, useValue: jest.fn() },
        {
          provide: TrackingService,
          useValue: {
            track: jest.fn(),
            TrackedEventsMap: {
              SP_REQUESTED_FC_TOKEN: {},
              SP_REQUESTED_FC_USERINFO: {},
            },
          },
        },
        { provide: IdentityProviderAdapterMongoService, useValue: jest.fn() },
      ],
    }).compile();

    service = module.get<CoreFcaMiddlewareService>(CoreFcaMiddlewareService);
    mockConfigService = module.get<ConfigService>(
      ConfigService,
    ) as jest.Mocked<ConfigService>;
    mockOidcProviderService = module.get<OidcProviderService>(
      OidcProviderService,
    ) as jest.Mocked<OidcProviderService>;
    mockSessionService = module.get<SessionService>(
      SessionService,
    ) as jest.Mocked<SessionService>;
    mockTrackingService = module.get<TrackingService>(
      TrackingService,
    ) as jest.Mocked<TrackingService>;
    validateMock = jest.mocked(validate);
  });

  it('should register all middleware in onModuleInit', () => {
    const spy = jest.spyOn((service as any).oidcProvider, 'registerMiddleware');
    service.onModuleInit();
    expect(spy).toHaveBeenCalledTimes(4);
  });

  it('should handle errors in koaErrorCatcherMiddlewareFactory correctly', async () => {
    const mockCtx = { oidc: { isError: undefined }, req: {}, res: {} };
    const middleware = jest.fn().mockRejectedValue(new Error('Test Error'));
    const catcher = (service as any).koaErrorCatcherMiddlewareFactory(
      middleware,
    );
    await catcher(mockCtx);
    expect(mockCtx.oidc.isError).toBe(true);
  });

  it('should extract authorization parameters based on HTTP method', () => {
    const postCtx = { method: 'POST', req: { body: { param: 'value' } } };
    const getCtx = { method: 'GET', req: { query: { param: 'value' } } };

    expect((service as any).getAuthorizationParameters(postCtx)).toEqual(
      postCtx.req.body,
    );
    expect((service as any).getAuthorizationParameters(getCtx)).toEqual(
      getCtx.req.query,
    );
  });

  it('should reset cookies and clear headers in beforeAuthorizeMiddleware', () => {
    const mockCtx = { req: { headers: {} }, res: {} } as any as OidcCtx;
    const spy = jest.spyOn(mockOidcProviderService, 'clearCookies');

    (service as any).beforeAuthorizeMiddleware(mockCtx);
    expect(spy).toHaveBeenCalledWith(mockCtx.res);
    expect(mockCtx.req.headers.cookie).toBe('');
  });

  it('should log warning for unsupported methods and override prompt in overrideAuthorizePrompt', () => {
    mockConfigService.get.mockReturnValue({
      forcedPrompt: ['login', 'consent'],
    });

    const postCtx = {
      method: 'POST',
      req: { body: { prompt: 'login' } },
    } as any as OidcCtx;
    (service as any).overrideAuthorizePrompt(postCtx);
    expect(postCtx.req.body.prompt).toBe('login consent');

    const getCtx = {
      method: 'GET',
      query: { prompt: 'login' },
    } as any as OidcCtx;
    (service as any).overrideAuthorizePrompt(getCtx);
    expect(getCtx.query.prompt).toBe('login consent');

    const unsupportedCtx = {
      method: 'PUT',
      req: { body: {} },
      query: {},
    } as any as OidcCtx;
    (service as any).overrideAuthorizePrompt(unsupportedCtx);
    expect(unsupportedCtx.req.body.prompt).toBeUndefined();
    expect(unsupportedCtx.query.prompt).toBeUndefined();
  });

  it('should return the event context with session IDs in getEventContext', async () => {
    const mockCtx = {
      oidc: { entities: { Account: { accountId: '123' } } },
      req: {},
    };
    mockSessionService.getAlias.mockResolvedValueOnce('123');
    const eventContext = await (service as any).getEventContext(mockCtx);
    expect(eventContext.sessionId).toBe('123');
  });

  it('should throw CoreNoSessionIdException if session ID is not set in getEventContext', async () => {
    const mockCtx = { oidc: {}, req: {} };
    await expect((service as any).getEventContext(mockCtx)).rejects.toThrow(
      CoreNoSessionIdException,
    );
  });

  it('should initialize session, set alias, and track event in tokenMiddleware', async () => {
    const mockCtx = {
      oidc: { entities: { AccessToken: {}, Account: { accountId: '123' } } },
    };
    mockSessionService.getAlias.mockResolvedValueOnce('123');
    const spyInitCache = jest.spyOn(mockSessionService, 'initCache');
    const spyTrack = jest.spyOn(mockTrackingService, 'track');
    await (service as any).tokenMiddleware(mockCtx);
    expect(spyInitCache).toHaveBeenCalled();
    expect(spyTrack).toHaveBeenCalled();
  });

  it('should initialize session and track event in userinfoMiddleware', async () => {
    const mockCtx = {
      oidc: { entities: { Account: { accountId: '123' } } },
    };
    mockSessionService.getAlias.mockResolvedValueOnce('123');
    const spyInitCache = jest.spyOn(mockSessionService, 'initCache');
    const spyTrack = jest.spyOn(mockTrackingService, 'track');
    await (service as any).userinfoMiddleware(mockCtx);
    expect(spyInitCache).toHaveBeenCalled();
    expect(spyTrack).toHaveBeenCalled();
  });

  it('should handle silent authentication prompts in handleSilentAuthenticationMiddleware', async () => {
    const mockCtx = { method: 'POST', req: { body: { prompt: 'none' } } };
    const spyOverride = jest.spyOn(service as any, 'overrideAuthorizePrompt');
    mockSessionService.get.mockReturnValueOnce({});
    validateMock.mockResolvedValueOnce([]);
    mockConfigService.get.mockReturnValueOnce({
      forcedPrompt: ['login', 'consent'],
    });
    await (service as any).handleSilentAuthenticationMiddleware(mockCtx);
    expect(spyOverride).toHaveBeenCalled();
  });

  it('should handle silent authentication prompts in handleSilentAuthenticationMiddleware', async () => {
    const mockCtx = { method: 'POST', req: { body: {} } };
    const spyOverride = jest.spyOn(service as any, 'overrideAuthorizePrompt');
    mockConfigService.get.mockReturnValueOnce({
      forcedPrompt: ['login', 'consent'],
    });
    await (service as any).handleSilentAuthenticationMiddleware(mockCtx);
    expect(spyOverride).toHaveBeenCalled();
  });
});
