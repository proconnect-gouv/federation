import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@fc/config';

import {
  AuthorizeParamsDto,
  LogoutParamsDto,
  RevocationTokenParamsDTO,
} from './dto';
import { OidcProviderController } from './oidc-provider.controller';
import { OidcProviderService } from './oidc-provider.service';

describe('OidcProviderController', () => {
  let controller: OidcProviderController;
  let configService: { get: jest.Mock };
  let oidcProviderService: { getCallback: jest.Mock };
  let handler: jest.Mock;

  const urlPrefix = '/prefix';
  const buildReqRes = (path = '/authorize') => {
    const originalUrl = `${urlPrefix}${path}`;
    const req: any = { originalUrl };
    const res: any = {};
    return { req, res };
  };

  beforeEach(async () => {
    handler = jest.fn().mockReturnValue('handler-result');
    oidcProviderService = {
      getCallback: jest.fn().mockReturnValue(handler),
    };
    configService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'App') {
          return { urlPrefix } as any;
        }
        return undefined;
      }),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [OidcProviderController],
      providers: [
        { provide: ConfigService, useValue: configService },
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
    it('should rewrite url and call provider callback', () => {
      const { req, res } = buildReqRes('/end-session');
      const query = {} as LogoutParamsDto;

      const result = controller.getEndSession(req, res, query as any);

      expect(req.url).toBe('/end-session');
      expectCommonBehavior(req, res, result);
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
