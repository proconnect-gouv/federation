import { validate, ValidationError } from 'class-validator';

import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@fc/config';
import { LoggerService } from '@fc/logger';
import { TrackedEvent } from '@fc/logger/enums';
import { OidcClientService } from '@fc/oidc-client';
import { OidcProviderService } from '@fc/oidc-provider/oidc-provider.service';
import { ISessionService } from '@fc/session';

import { getLoggerMock } from '@mocks/logger';

import {
  AuthorizeParamsDto,
  LogoutParamsDto,
  RevocationTokenParamsDTO,
  UserSession,
} from '../dto';
import { OidcProviderController } from './oidc-provider.controller';

jest.mock('class-validator', () => ({
  ...jest.requireActual('class-validator'),
  validate: jest.fn(),
}));

describe('OidcProviderController', () => {
  let controller: OidcProviderController;
  let configService: { get: jest.Mock };
  let oidcProviderService: { getCallback: jest.Mock };
  let oidcClientService: OidcClientService;
  let handler: jest.Mock;
  let loggerMock: ReturnType<typeof getLoggerMock>;

  const urlPrefix = '/prefix';
  const buildReqRes = (path = '/authorize') => {
    const originalUrl = `${urlPrefix}${path}`;
    const req: any = { originalUrl, query: {} };
    const res: any = { redirect: jest.fn() };
    return { req, res };
  };

  beforeEach(async () => {
    handler = jest.fn().mockReturnValue('handler-result');
    oidcProviderService = {
      getCallback: jest.fn().mockReturnValue(handler),
    };
    oidcClientService = {
      hasEndSessionUrl: jest.fn(),
      getEndSessionUrl: jest.fn(),
    } as unknown as OidcClientService;

    configService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'App') {
          return { urlPrefix } as any;
        }
        return undefined;
      }),
    };

    loggerMock = getLoggerMock();

    const app: TestingModule = await Test.createTestingModule({
      controllers: [OidcProviderController],
      providers: [
        { provide: ConfigService, useValue: configService },
        { provide: LoggerService, useValue: loggerMock },
        { provide: OidcClientService, useValue: oidcClientService },
        { provide: OidcProviderService, useValue: oidcProviderService },
      ],
    }).compile();

    controller = app.get<OidcProviderController>(OidcProviderController);
    jest.resetAllMocks();
    // Reconfigure mocks after reset
    handler = jest.fn().mockReturnValue('handler-result');
    oidcProviderService.getCallback.mockReturnValue(handler);
    configService.get.mockImplementation((key: string) =>
      key === 'App' ? ({ urlPrefix } as any) : undefined,
    );
  });

  const expectCommonBehavior = (req: any, res: any, result: any) => {
    expect(oidcProviderService.getCallback).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(req, res);
    expect(result).toBe('handler-result');
  };

  describe('getAuthorize()', () => {
    it('should rewrite url and call provider callback', () => {
      const { req, res } = buildReqRes('/authorize');
      const query = {} as AuthorizeParamsDto;

      const result = controller.getAuthorize(req, res, query as any);

      expect(req.url).toBe('/authorize');
      expectCommonBehavior(req, res, result);
    });
  });

  describe('postAuthorize()', () => {
    it('should rewrite url and call provider callback', () => {
      const { req, res } = buildReqRes('/authorize');
      const body = {} as AuthorizeParamsDto;

      const result = controller.postAuthorize(req, res, body as any);

      expect(req.url).toBe('/authorize');
      expectCommonBehavior(req, res, result);
    });
  });

  describe('getAuthorizeResume()', () => {
    it('should rewrite url and call provider callback', () => {
      const { req, res } = buildReqRes('/resume');

      const result = controller.getAuthorizeResume(req, res);

      expect(req.url).toBe('/resume');
      expectCommonBehavior(req, res, result);
    });
  });

  describe('postToken()', () => {
    it('should rewrite url and call provider callback', () => {
      const { req, res } = buildReqRes('/token');

      const result = controller.postToken(req, res);

      expect(req.url).toBe('/token');
      expectCommonBehavior(req, res, result);
    });
  });

  describe('revokeToken()', () => {
    it('should rewrite url and call provider callback', () => {
      const { req, res } = buildReqRes('/revocation');
      const body = {} as RevocationTokenParamsDTO;

      const result = controller.revokeToken(req, res, body as any);

      expect(req.url).toBe('/revocation');
      expectCommonBehavior(req, res, result);
    });
  });

  describe('getUserInfo()', () => {
    it('should rewrite url and call provider callback', () => {
      const { req, res } = buildReqRes('/userinfo');

      const result = controller.getUserInfo(req, res);

      expect(req.url).toBe('/userinfo');
      expectCommonBehavior(req, res, result);
    });
  });

  describe('postUserInfo()', () => {
    it('should rewrite url and call provider callback', () => {
      const { req, res } = buildReqRes('/userinfo');

      const result = controller.postUserInfo(req, res);

      expect(req.url).toBe('/userinfo');
      expectCommonBehavior(req, res, result);
    });
  });

  describe('getEndSession()', () => {
    let userSession: ISessionService<UserSession>;

    beforeEach(() => {
      userSession = {
        get: jest.fn().mockReturnValue({
          idpId: 'idp',
          idpIdToken: 'token',
        } as unknown as UserSession),
        clear: jest.fn(),
        set: jest.fn(),
        destroy: jest.fn(),
      } as unknown as ISessionService<UserSession>;
    });

    it('should clear session and redirect to IdP end-session when user is connected and IdP supports it', async () => {
      const { req, res } = buildReqRes('/end-session');
      req.query = { a: '1' }; // from_idp not present => SP initiated
      const query = {} as LogoutParamsDto;
      oidcClientService.hasEndSessionUrl = jest.fn().mockResolvedValue(true);
      oidcClientService.getEndSessionUrl = jest
        .fn()
        .mockResolvedValue('/end-session-url');

      // Force user connected
      const validateMock = jest.mocked(validate);
      validateMock.mockResolvedValue([]);

      await controller.getEndSession(req, res, query, userSession);

      expect(oidcProviderService.getCallback).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith('/end-session-url');

      // Logging
      expect(loggerMock.track).toHaveBeenCalledWith(
        TrackedEvent.SP_REQUESTED_LOGOUT,
      );
      expect(loggerMock.track).toHaveBeenCalledWith(
        TrackedEvent.FC_REQUESTED_LOGOUT_FROM_IDP,
      );
    });

    it('should terminate locally when IdP has no end-session URL', async () => {
      const { req, res } = buildReqRes('/end-session');
      // eslint-disable-next-line @typescript-eslint/naming-convention
      req.query = { from_idp: 'false' };
      const query = {} as LogoutParamsDto;
      oidcClientService.hasEndSessionUrl = jest.fn().mockResolvedValue(false);
      oidcClientService.getEndSessionUrl = jest
        .fn()
        .mockResolvedValue(undefined);

      // Force user connected
      const validateMock = jest.mocked(validate);
      validateMock.mockResolvedValue([]);

      await controller.getEndSession(req, res, query, userSession);

      expect(res.redirect).not.toHaveBeenCalled();
      expect(oidcProviderService.getCallback).toHaveBeenCalledTimes(1);

      // Logging
      expect(loggerMock.track).toHaveBeenCalledWith(
        TrackedEvent.SP_REQUESTED_LOGOUT,
      );
      expect(loggerMock.track).toHaveBeenCalledWith(
        TrackedEvent.FC_SESSION_TERMINATED,
      );
    });

    it('should not log SP_REQUESTED_LOGOUT when called back from IdP and should terminate locally when user is not connected', async () => {
      const { req, res } = buildReqRes('/end-session');
      // eslint-disable-next-line @typescript-eslint/naming-convention
      req.query = { from_idp: 'true' };
      const query = {} as LogoutParamsDto;

      // Make validation report user NOT connected
      const validateMock = jest.mocked(validate);
      validateMock.mockResolvedValue([new ValidationError()]);

      await controller.getEndSession(req, res, query, userSession);

      expect(res.redirect).not.toHaveBeenCalled();
      expect(oidcProviderService.getCallback).toHaveBeenCalledTimes(1);

      // Logging
      expect(loggerMock.track).not.toHaveBeenCalledWith(
        TrackedEvent.SP_REQUESTED_LOGOUT,
      );
      expect(loggerMock.track).toHaveBeenCalledWith(
        TrackedEvent.FC_SESSION_TERMINATED,
      );
    });
  });

  describe('postEndSessionConfirm()', () => {
    it('should rewrite url and call provider callback', () => {
      const { req, res } = buildReqRes('/end-session/confirm');

      const result = controller.postEndSessionConfirm(req, res);

      expect(req.url).toBe('/end-session/confirm');
      expectCommonBehavior(req, res, result);
    });
  });

  describe('getJwks()', () => {
    it('should rewrite url and call provider callback', () => {
      const { req, res } = buildReqRes('/jwks');

      const result = controller.getJwks(req, res);

      expect(req.url).toBe('/jwks');
      expectCommonBehavior(req, res, result);
    });
  });

  describe('getOpenidConfiguration()', () => {
    it('should rewrite url and call provider callback', () => {
      const { req, res } = buildReqRes('/.well-known/openid-configuration');

      const result = controller.getOpenidConfiguration(req, res);

      expect(req.url).toBe('/.well-known/openid-configuration');
      expectCommonBehavior(req, res, result);
    });
  });

  describe('postTokenIntrospection()', () => {
    it('should rewrite url and call provider callback', () => {
      const { req, res } = buildReqRes('/introspection');

      const result = controller.postTokenIntrospection(req, res);

      expect(req.url).toBe('/introspection');
      expectCommonBehavior(req, res, result);
    });
  });
});
