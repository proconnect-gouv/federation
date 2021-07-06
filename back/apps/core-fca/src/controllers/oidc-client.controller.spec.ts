import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import {
  SessionGenericCsrfService,
  SessionGenericInvalidCsrfSelectIdpException,
  SessionGenericService,
} from '@fc/session-generic';
import { TrackingService } from '@fc/tracking';
import { ConfigService } from '@fc/config';
import { OidcClientService } from '@fc/oidc-client';
import { OidcClientController } from './oidc-client.controller';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';

describe('OidcClient Controller', () => {
  let controller: OidcClientController;
  let res;

  const oidcClientServiceMock = {
    utils: {
      getAuthorizeUrl: jest.fn(),
      wellKnownKeys: jest.fn(),
      buildAuthorizeParameters: jest.fn(),
      checkIdpBlacklisted: jest.fn(),
      checkCsrfTokenValidity: jest.fn(),
    },
  };

  const loggerServiceMock = {
    setContext: jest.fn(),
    verbose: jest.fn(),
    debug: jest.fn(),
    businessEvent: jest.fn(),
    trace: jest.fn(),
  } as unknown as LoggerService;

  const sessionGenericServiceMock = {
    set: jest.fn(),
    get: jest.fn(),
  };

  const sessionGenericCsrfServiceMock = {
    get: jest.fn(),
    save: jest.fn(),
    validate: jest.fn(),
  };

  const identityProviderServiceMock = {
    getById: jest.fn(),
  };

  const trackingMock = {
    track: jest.fn(),
  };

  const appConfigMock = {
    urlPrefix: '/api/v2',
  };

  const configServiceMock = {
    get: () => appConfigMock,
  };

  const spIdMock = 'spIdMock';
  const stateMock = 'stateMock';
  const nonceMock = 'nonceMock';

  const providerIdMock = 'providerIdMockValue';

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OidcClientController],
      providers: [
        OidcClientService,
        LoggerService,
        SessionGenericService,
        SessionGenericCsrfService,
        TrackingService,
        ConfigService,
        IdentityProviderAdapterMongoService,
      ],
    })
      .overrideProvider(OidcClientService)
      .useValue(oidcClientServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(SessionGenericService)
      .useValue(sessionGenericServiceMock)
      .overrideProvider(TrackingService)
      .useValue(trackingMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(SessionGenericCsrfService)
      .useValue(sessionGenericCsrfServiceMock)
      .overrideProvider(IdentityProviderAdapterMongoService)
      .useValue(identityProviderServiceMock)
      .compile();

    controller = module.get<OidcClientController>(OidcClientController);

    res = {
      redirect: jest.fn(),
    };

    identityProviderServiceMock.getById.mockReturnValue({ name: 'foo' });
    sessionGenericServiceMock.get.mockResolvedValue({
      spId: spIdMock,
      idpState: stateMock,
      idpNonce: nonceMock,
    });

    oidcClientServiceMock.utils.buildAuthorizeParameters.mockReturnValue({
      state: stateMock,
      nonce: nonceMock,
      scope: 'scopeMock',
      providerUid: providerIdMock,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: 'acrMock',
    });

    sessionGenericCsrfServiceMock.save.mockResolvedValueOnce(true);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('redirectToIdp()', () => {
    beforeEach(() => {
      controller['appendSpIdToAuthorizeUrl'] = jest.fn();
    });

    it('should call oidc-client-service for retrieve authorize url', async () => {
      // setup
      const body = {
        scope: 'openid',
        providerUid: providerIdMock,
        // oidc param
        // eslint-disable-next-line @typescript-eslint/naming-convention
        acr_values: 'eidas3',
        claims: 'json_stringified',
        nonce: nonceMock,
        csrfToken: 'csrfMockValue',
      };

      const authorizeUrlMock = 'https://my-authentication-openid-url.com';

      oidcClientServiceMock.utils.getAuthorizeUrl.mockReturnValueOnce(
        authorizeUrlMock,
      );

      const expectedGetAuthorizeCallParameter = {
        // oidc parameter
        // eslint-disable-next-line @typescript-eslint/naming-convention
        acr_values: 'eidas3',
        claims: 'json_stringified',
        nonce: 'nonceMock',
        providerUid: 'providerIdMockValue',
        scope: 'openid',
        state: 'stateMock',
      };

      // action
      await controller.redirectToIdp(res, body, sessionGenericServiceMock);

      // assert
      expect(oidcClientServiceMock.utils.getAuthorizeUrl).toHaveBeenCalledTimes(
        1,
      );
      expect(oidcClientServiceMock.utils.getAuthorizeUrl).toHaveBeenCalledWith(
        expectedGetAuthorizeCallParameter,
      );
    });

    it('should call appendSpIdToAuthorizeUrl with serviceProviderId and authorizationUrl from getAuthorizeUrl', async () => {
      // setup
      const body = {
        scope: 'openid',
        providerUid: providerIdMock,
        // oidc param
        // eslint-disable-next-line @typescript-eslint/naming-convention
        acr_values: 'eidas3',
        claims: 'json_stringified',
        nonce: nonceMock,
        csrfToken: 'csrfMockValue',
      };

      const authorizeUrlMock = 'https://my-authentication-openid-url.com';

      oidcClientServiceMock.utils.getAuthorizeUrl.mockReturnValueOnce(
        authorizeUrlMock,
      );

      // action
      await controller.redirectToIdp(res, body, sessionGenericServiceMock);

      // assert
      expect(controller['appendSpIdToAuthorizeUrl']).toHaveBeenCalledTimes(1);
      expect(controller['appendSpIdToAuthorizeUrl']).toHaveBeenCalledWith(
        spIdMock,
        authorizeUrlMock,
      );
    });

    it('should call res.redirect() with the authorizeUrl and the spId as query parameter', async () => {
      // setup
      const body = {
        scope: 'openid',
        providerUid: providerIdMock,
        // oidc param
        // eslint-disable-next-line @typescript-eslint/naming-convention
        acr_values: 'eidas3',
        claims: 'json_stringified',
        nonce: nonceMock,
        csrfToken: 'csrfMockValue',
      };

      const authorizeUrlMock = 'https://my-authentication-openid-url.com';
      const authorizeUrlWithSpIdMock = `${authorizeUrlMock}&sp_id=${spIdMock}`;
      controller['appendSpIdToAuthorizeUrl'] = jest
        .fn()
        .mockReturnValueOnce(authorizeUrlWithSpIdMock);

      oidcClientServiceMock.utils.getAuthorizeUrl.mockReturnValueOnce(
        authorizeUrlMock,
      );

      // action
      await controller.redirectToIdp(res, body, sessionGenericServiceMock);

      // assert
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith(authorizeUrlWithSpIdMock);
    });

    it('should store state and nonce in session', async () => {
      // setup
      const body = {
        scope: 'openid',
        providerUid: providerIdMock,
        // oidc param
        // eslint-disable-next-line @typescript-eslint/naming-convention
        acr_values: 'eidas3',
        claims: 'json_stringified',
        nonce: nonceMock,
        csrfToken: 'csrfMockValue',
      };

      const authorizeUrlMock = 'https://my-authentication-openid-url.com';

      oidcClientServiceMock.utils.getAuthorizeUrl.mockReturnValueOnce(
        authorizeUrlMock,
      );

      // action
      await controller.redirectToIdp(res, body, sessionGenericServiceMock);

      // assert
      expect(sessionGenericServiceMock.set).toHaveBeenCalledTimes(1);
      expect(sessionGenericServiceMock.set).toHaveBeenCalledWith({
        idpId: body.providerUid,
        idpName: 'foo',
        idpState: stateMock,
        idpNonce: nonceMock,
      });
    });

    it('should resolve even if no spId are fetchable', async () => {
      // setup
      const body = {
        scope: 'openid',
        providerUid: providerIdMock,
        // oidc param
        // eslint-disable-next-line @typescript-eslint/naming-convention
        acr_values: 'eidas3',
        nonce: nonceMock,
        claims: 'any_formatted_json_string',
        csrfToken: 'csrfMockValue',
      };
      sessionGenericServiceMock.get.mockImplementationOnce(() => {
        throw new Error();
      });

      // action
      await controller.redirectToIdp(res, body, sessionGenericServiceMock);

      // assert
      expect(res.redirect).toHaveBeenCalledTimes(1);
    });

    it('should throw an error because idp is blacklisted', async () => {
      // Given
      const csrfTokenBody = 'invalidCsrfMockValue';
      const body = {
        scope: 'openid',
        providerUid: providerIdMock,
        // oidc param
        // eslint-disable-next-line @typescript-eslint/naming-convention
        acr_values: 'eidas3',
        nonce: nonceMock,
        claims: 'any_formatted_json_string',
        csrfToken: csrfTokenBody,
      };
      sessionGenericServiceMock.get.mockReturnValueOnce('spId');
      sessionGenericCsrfServiceMock.validate
        .mockReset()
        .mockImplementation(() => {
          throw new Error(
            'Une erreur technique est survenue, fermez l’onglet de votre navigateur et reconnectez-vous.',
          );
        });
      // When/Then
      await expect(
        controller.redirectToIdp(res, body, sessionGenericServiceMock),
      ).rejects.toThrow(SessionGenericInvalidCsrfSelectIdpException);
    });

    it('should throw an error if the two CSRF tokens (provided in request and previously stored in session) are not the same.', async () => {
      // setup
      const body = {
        scope: 'openid',
        providerUid: providerIdMock,
        // oidc param
        // eslint-disable-next-line @typescript-eslint/naming-convention
        acr_values: 'eidas3',
        nonce: nonceMock,
        claims: 'any_formatted_json_string',
        csrfToken: 'csrfMockValue',
      };
      sessionGenericServiceMock.get.mockReturnValueOnce('spId');

      // action
      await controller.redirectToIdp(res, body, sessionGenericServiceMock);

      // assert
      expect(sessionGenericServiceMock.get).toHaveBeenLastCalledWith();
      expect(res.redirect).toHaveBeenCalledTimes(1);
    });

    describe('Idp blacklisted scenario for redirect to idp', () => {
      let isBlacklistedMock;
      beforeEach(() => {
        isBlacklistedMock = oidcClientServiceMock.utils.checkIdpBlacklisted =
          jest.fn();
      });

      it('idp is blacklisted', async () => {
        // setup
        const body = {
          scope: 'openid',
          providerUid: providerIdMock,
          // oidc param
          // eslint-disable-next-line @typescript-eslint/naming-convention
          acr_values: 'eidas3',
          nonce: nonceMock,
          claims: 'any_formatted_json_string',
          csrfToken: 'csrfMockValue',
        };
        const errorMock = new Error('New Error');
        sessionGenericServiceMock.get.mockReturnValueOnce({
          spId: 'spIdValue',
        });
        isBlacklistedMock.mockRejectedValueOnce(errorMock);

        // action / assert
        await expect(() =>
          controller.redirectToIdp(res, body, sessionGenericServiceMock),
        ).rejects.toThrow(errorMock);
        expect(sessionGenericServiceMock.get).toHaveBeenLastCalledWith();
      });

      it('idp is not blacklisted', async () => {
        // setup
        const body = {
          scope: 'openid',
          providerUid: providerIdMock,
          // oidc param
          // eslint-disable-next-line @typescript-eslint/naming-convention
          acr_values: 'eidas3',
          nonce: nonceMock,
          claims: 'any_formatted_json_string',
          csrfToken: 'csrfMockValue',
        };
        sessionGenericServiceMock.get.mockReturnValueOnce({
          spId: 'spIdValue',
        });
        isBlacklistedMock.mockReturnValueOnce(false);

        // action
        await controller.redirectToIdp(res, body, sessionGenericServiceMock);

        // assert
        expect(sessionGenericServiceMock.get).toHaveBeenLastCalledWith();
        expect(res.redirect).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('getWellKnownKeys()', () => {
    it('should call oidc-client-service for wellKnownKeys', async () => {
      // When
      await controller.getWellKnownKeys();
      // Then
      expect(oidcClientServiceMock.utils.wellKnownKeys).toHaveBeenCalledTimes(
        1,
      );
    });
  });

  describe('appendSpIdToAuthorizeUrl()', () => {
    it('should return the auuthorize url with the query param sp_id', () => {
      // setup
      const authorizeUrlMock = 'https://my-authentication-openid-url.com';
      const authorizeUrlWithSpIdMock = `${authorizeUrlMock}&sp_id=${spIdMock}`;

      // action
      const result = controller['appendSpIdToAuthorizeUrl'](
        spIdMock,
        authorizeUrlMock,
      );

      // expect
      expect(result).toStrictEqual(authorizeUrlWithSpIdMock);
    });
  });
});
