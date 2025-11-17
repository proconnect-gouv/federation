import { KoaContextWithOIDC, Provider } from 'oidc-provider';

import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@fc/config';
import { LoggerService } from '@fc/logger';
import { OidcClientService } from '@fc/oidc-client';
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

  const oidcClientServiceMock = {
    hasEndSessionUrl: jest.fn(),
  };

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

  const idpIdMock = 'idp_id';
  const userSessionMock = {
    idpId: idpIdMock,
    browsingSessionId: 'browsing-session-id',
    reusesActiveSession: false,
    interactionId: 'interaction-id',
    idpName: 'idp-name',
    idpLabel: 'idp-label',
    idpAcr: 'idp-acr',
    idpIdToken: 'idp-id-token',
    idpIdentity: {
      sub: 'idp_sub',
    },
    spEssentialAcr: 'sp-essential-acr',
    spId: 'sp-id',
    spName: 'sp-name',
  };

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
        OidcClientService,
        ConfigService,
      ],
    })
      .overrideProvider(SessionService)
      .useValue(sessionServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(OidcClientService)
      .useValue(oidcClientServiceMock)
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
    beforeEach(() => {
      service['logoutFormSessionDestroy'] = jest.fn();
    });

    it('should call hasEndSessionUrl if session & idpId is defined', async () => {
      // Given
      sessionServiceMock.getAlias.mockResolvedValue('session-id');
      sessionServiceMock.initCache.mockResolvedValue(undefined);
      sessionServiceMock.get.mockReturnValue(userSessionMock);

      // When
      await service.logoutSource(ctxMock, form);

      // Then
      expect(sessionServiceMock.getAlias).toHaveBeenCalledWith('test-sub');
      expect(sessionServiceMock.initCache).toHaveBeenCalledWith('session-id');
      expect(sessionServiceMock.get).toHaveBeenCalledWith('User');
      expect(oidcClientServiceMock.hasEndSessionUrl).toHaveBeenCalledTimes(1);
    });

    it('should call logoutFormSessionDestroy with given parameters if session & idpId is defined and hasEndSessionUrl return true', async () => {
      // Given
      sessionServiceMock.getAlias.mockResolvedValue('session-id');
      sessionServiceMock.initCache.mockResolvedValue(undefined);
      sessionServiceMock.get.mockReturnValue(userSessionMock);
      oidcClientServiceMock.hasEndSessionUrl.mockResolvedValue(true);

      const expectedParamsMock = {
        method: 'POST',
        title: 'Déconnexion du FI',
        uri: '/api/v2/client/disconnect-from-idp',
      };

      // When
      await service.logoutSource(ctxMock, form);

      // Then
      expect(sessionServiceMock.getAlias).toHaveBeenCalledWith('test-sub');
      expect(sessionServiceMock.initCache).toHaveBeenCalledWith('session-id');
      expect(sessionServiceMock.get).toHaveBeenCalledWith('User');
      expect(service['logoutFormSessionDestroy']).toHaveBeenCalledTimes(1);
      expect(service['logoutFormSessionDestroy']).toHaveBeenCalledWith(
        ctxMock,
        form,
        expectedParamsMock,
      );
    });

    it('should call logoutFormSessionDestroy with given parameters if hasEndSessionUrl is false', async () => {
      // Given
      sessionServiceMock.getAlias.mockResolvedValue('session-id');
      sessionServiceMock.initCache.mockResolvedValue(undefined);
      sessionServiceMock.get.mockReturnValue(userSessionMock);
      oidcClientServiceMock.hasEndSessionUrl.mockResolvedValue(false);

      const expectedParamsMock = {
        method: 'GET',
        title: 'Déconnexion FC',
        uri: '/api/v2/client/logout-callback',
      };

      // When
      await service.logoutSource(ctxMock, form);

      // Then
      expect(sessionServiceMock.getAlias).toHaveBeenCalledWith('test-sub');
      expect(sessionServiceMock.initCache).toHaveBeenCalledWith('session-id');
      expect(sessionServiceMock.get).toHaveBeenCalledWith('User');
      expect(service['logoutFormSessionDestroy']).toHaveBeenCalledTimes(1);
      expect(service['logoutFormSessionDestroy']).toHaveBeenCalledWith(
        ctxMock,
        form,
        expectedParamsMock,
      );
    });

    it('should render logout page when session is not found', async () => {
      // Given
      sessionServiceMock.getAlias.mockImplementationOnce(() => {
        throw new Error('Session not found');
      });

      // When
      await service.logoutSource(ctxMock, form);

      // Then
      expect(ctxMock.body).toBeDefined();
    });
  });

  describe('getLogoutParams', () => {
    it('should return params with idp logout url if hasIdpLogoutUrl is true', async () => {
      // Given
      const expectedParamsMock = {
        method: 'POST',
        title: 'Déconnexion du FI',
        uri: '/api/v2/client/disconnect-from-idp',
      };
      service['hasIdpLogoutUrl'] = jest.fn().mockResolvedValue(true);

      // When
      const result = await service['getLogoutParams'](idpIdMock);

      // Then
      expect(result).toEqual(expectedParamsMock);
    });

    it('should return params with client logout url if hasIdpLogoutUrl is false', async () => {
      // Given
      const expectedParamsMock = {
        method: 'GET',
        title: 'Déconnexion FC',
        uri: '/api/v2/client/logout-callback',
      };
      service['hasIdpLogoutUrl'] = jest.fn().mockResolvedValue(false);

      // When
      const result = await service['getLogoutParams'](idpIdMock);

      // Then
      expect(result).toEqual(expectedParamsMock);
    });
  });

  describe('hasIdpLogoutUrl', () => {
    it('should return false if idpId is not defined', async () => {
      // When
      const result = await service['hasIdpLogoutUrl'](undefined);
      // Then
      expect(result).toBe(false);
    });

    it('should call hasEndSessionUrl with idpId if idpId is defined', async () => {
      // Given
      // When
      await service['hasIdpLogoutUrl'](idpIdMock);
      // Then
      expect(oidcClientServiceMock.hasEndSessionUrl).toHaveBeenCalledTimes(1);
      expect(oidcClientServiceMock.hasEndSessionUrl).toHaveBeenCalledWith(
        idpIdMock,
      );
    });

    it('should return result from call to hasEndSessionUrl', async () => {
      // Given
      const hasEndSessionUrlResult = Symbol('hasEndSessionUrlResult');
      oidcClientServiceMock.hasEndSessionUrl.mockResolvedValue(
        hasEndSessionUrlResult,
      );
      // When
      const result = await service['hasIdpLogoutUrl'](idpIdMock);
      // Then
      expect(result).toBe(hasEndSessionUrlResult);
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

  describe('logoutFormSessionDestroy', () => {
    const params = {
      method: 'method',
      uri: '/uri',
      title: 'Title',
    };

    it('should save oidc logout confirmation form within oidc client session', async () => {
      // Given
      const logoutFormProperty = 'oidcProviderLogoutForm';
      // When
      await service.logoutFormSessionDestroy(ctxMock, form, params);
      // Then
      expect(sessionServiceMock.set).toHaveBeenCalledWith(
        'User',
        logoutFormProperty,
        form,
      );
    });

    it('should commit changes to session', async () => {
      // When
      await service.logoutFormSessionDestroy(ctxMock, form, params);
      // Then
      expect(sessionServiceMock.commit).toHaveBeenCalledTimes(1);
    });

    it('should set a body property to koa context', async () => {
      // Given
      const htmlDisconnectFromFi = `<!DOCTYPE html>
      <head>
        <title>Title</title>
      </head>
      <body>
        <form method="method" action="/uri">
        </form>
        <script>
          var form = document.forms[0];
          form.submit();
        </script>
      </body>
    </html>`;
      // When
      await service.logoutFormSessionDestroy(ctxMock, form, params);
      // Then
      expect(ctxMock).toHaveProperty('body', htmlDisconnectFromFi);
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
