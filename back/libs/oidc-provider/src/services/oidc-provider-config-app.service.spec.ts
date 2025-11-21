import { KoaContextWithOIDC, Provider } from 'oidc-provider';

import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@fc/config';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';

import { getLoggerMock } from '@mocks/logger';
import { getSessionServiceMock } from '@mocks/session';

import { OidcCtx } from '../interfaces';
import { OidcProviderConfigAppService } from './oidc-provider-config-app.service';

jest.mock('@fc/exceptions/helpers', () => ({
  ...jest.requireActual('@fc/exceptions/helpers'),
  throwException: jest.fn(),
}));

describe('OidcProviderConfigAppService', () => {
  let service: OidcProviderConfigAppService;

  const sessionServiceMock = getSessionServiceMock();

  const configServiceMock = {
    get: jest.fn(),
  };

  const atHashMock = 'at_hash Mock value';
  const sessionId = 'sessionIdMock value';

  const loggerServiceMock = getLoggerMock();

  const reqMock = { sessionId };
  const resMock = {};

  const ctxMock = {
    sessionId,
    req: reqMock,
    res: resMock,
    oidc: {
      entities: {
        IdTokenHint: {
          payload: {
            // OIDC defined var name
            // eslint-disable-next-line @typescript-eslint/naming-convention
            at_hash: atHashMock,
          },
        },
      },
      session: {
        accountId: 'test-sub',
      },
    },
  } as unknown as OidcCtx;

  const appConfigMock = {
    urlPrefix: '/api/v2',
  };

  const form =
    '<form id="logoutId" method="post" action="https://redirect/me/there"><input type="hidden" name="xsrf" value="123456azerty"/></form>';

  const providerMock = {
    interactionFinished: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OidcProviderConfigAppService,
        SessionService,
        LoggerService,
        ConfigService,
      ],
    })
      .overrideProvider(SessionService)
      .useValue(sessionServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .compile();

    service = module.get<OidcProviderConfigAppService>(
      OidcProviderConfigAppService,
    );

    configServiceMock.get.mockReturnValue(appConfigMock);

    service['provider'] = providerMock as unknown as Provider;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('postLogoutSuccessSource', () => {
    it('should set a body property to koa context', () => {
      // Given
      const ctx = {
        request: {
          method: 'POST',
          url: 'https://url.com',
        },
        response: {
          status: 200,
          message: 'OK',
        },
        req: 'toto',
      } as unknown as KoaContextWithOIDC;

      const htmlPostLogoutSuccessSource = `<!DOCTYPE html>
        <head>
          <title>Déconnexion</title>
        </head>
        <body>
          <p>Vous êtes bien déconnecté, vous pouvez fermer votre navigateur.</p>
        </body>
        </html>`;

      // When
      service.postLogoutSuccessSource(ctx);

      // Then
      expect(ctx).toHaveProperty('body', htmlPostLogoutSuccessSource);
    });
  });

  describe('logoutSource', () => {
    it('should render logout page', () => {
      // When
      service.logoutSource(ctxMock, form);

      // Then
      expect(ctxMock.body).toBeDefined();
    });
  });

  describe('findAccount', () => {
    it('should return account details with accountId and claims when session is valid', async () => {
      // Given
      const sub = 'test-sub';
      const sessionId = 'test-session-id';
      const spIdentityMock = {
        sub: 'test-sub',
        given_name: 'John',
        family_name: 'Doe',
      };
      sessionServiceMock.getAlias.mockResolvedValueOnce(sessionId);
      sessionServiceMock.initCache.mockResolvedValueOnce(true);
      sessionServiceMock.get.mockReturnValueOnce({
        spIdentity: spIdentityMock,
      });

      // When
      const result = await service.findAccount(ctxMock, sub);

      // Then
      expect(sessionServiceMock.getAlias).toHaveBeenCalledWith(sub);
      expect(result).toEqual({
        accountId: spIdentityMock.sub,
        claims: expect.any(Function),
      });

      // Claims function test
      const claims = await result.claims();
      expect(claims).toEqual(spIdentityMock);
    });
  });

  describe('finishInteraction', () => {
    // Given
    const reqMock = {
      fc: { interactionId: 'interactiondMockValue' },
    };
    const resMock = {};
    const spIdentityMock = { sub: 'test-sub' };

    beforeEach(() => {
      sessionServiceMock.getId.mockReturnValue('sessionId');
      sessionServiceMock.get.mockReturnValueOnce({
        spIdentity: spIdentityMock,
      });
    });

    it('should finish interaction with grant', async () => {
      // Given
      const resultMock = {
        consent: {},
        login: {
          accountId: spIdentityMock.sub,
          acr: 'acrValue',
          amr: ['amrValue'],
          ts: expect.any(Number),
          remember: false,
        },
      };
      providerMock.interactionFinished.mockResolvedValueOnce('ignoredValue');
      // When
      await service.finishInteraction(reqMock, resMock, {
        amr: ['amrValue'],
        acr: 'acrValue',
      });

      // Then
      expect(sessionServiceMock.get).toHaveBeenCalledWith('User');
      expect(sessionServiceMock.setAlias).toHaveBeenCalledWith(
        spIdentityMock.sub,
        'sessionId',
      );
      expect(providerMock.interactionFinished).toHaveBeenCalledTimes(1);
      expect(providerMock.interactionFinished).toHaveBeenCalledWith(
        reqMock,
        resMock,
        resultMock,
      );
    });
  });

  describe('setProvider()', () => {
    it('should set provider value', () => {
      // Given
      const providerMock = 'providerMock' as unknown as Provider;
      // When
      service.setProvider(providerMock);
      // Then
      expect(service['provider']).toEqual('providerMock');
    });
  });

  describe('renderError', () => {
    it('should set ctx.type to html and render the error template with details', async () => {
      // Given
      const renderReturnMock = 'rendered-html';
      const renderMock = jest.fn().mockReturnValue(renderReturnMock);
      const ctx = {
        res: { render: renderMock },
      } as unknown as KoaContextWithOIDC;

      const params = {
        error: 'access_denied',
        error_description: 'Not allowed',
      } as unknown as Parameters<
        OidcProviderConfigAppService['renderError']
      >[1];

      // When
      await service.renderError(ctx, params, new Error('boom'));

      // Then
      expect(ctx).toHaveProperty('type', 'html');
      expect(renderMock).toHaveBeenCalledTimes(1);
      expect(renderMock).toHaveBeenCalledWith('error', {
        error: {
          code: 'oidc-provider-rendered-error:access_denied',
          id: expect.any(String),
          message: 'Not allowed',
        },
        exceptionDisplay: {},
      });
      expect(ctx).toHaveProperty('body', renderReturnMock);
    });
  });
});
