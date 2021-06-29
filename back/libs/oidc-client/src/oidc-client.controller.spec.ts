import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import {
  SessionGenericCsrfService,
  SessionGenericInvalidCsrfSelectIdpException,
  SessionGenericService,
} from '@fc/session-generic';
import { TrackingService } from '@fc/tracking';
import { ConfigService } from '@fc/config';
import { IDENTITY_PROVIDER_SERVICE } from './tokens';
import { OidcClientController } from './oidc-client.controller';
import { OidcClientService } from './services';

describe('OidcClient Controller', () => {
  let oidcClientController: OidcClientController;
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
        {
          provide: IDENTITY_PROVIDER_SERVICE,
          useValue: identityProviderServiceMock,
        },
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

      .compile();

    oidcClientController =
      module.get<OidcClientController>(OidcClientController);

    res = {
      redirect: jest.fn(),
    };

    identityProviderServiceMock.getById.mockReturnValue({ name: 'foo' });
    sessionGenericServiceMock.get.mockResolvedValue({
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
    expect(oidcClientController).toBeDefined();
  });

  describe('redirectToIdp()', () => {
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

      const mockedoidcClientService =
        'https://my-authentication-openid-url.com';

      oidcClientServiceMock.utils.getAuthorizeUrl.mockReturnValueOnce(
        mockedoidcClientService,
      );

      // action
      await oidcClientController.redirectToIdp(
        res,
        body,
        sessionGenericServiceMock,
      );

      // assert
      expect(oidcClientServiceMock.utils.getAuthorizeUrl).toHaveBeenCalledTimes(
        1,
      );
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith(mockedoidcClientService);
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

      const mockedoidcClientService =
        'https://my-authentication-openid-url.com';

      oidcClientServiceMock.utils.getAuthorizeUrl.mockReturnValueOnce(
        mockedoidcClientService,
      );

      // action
      await oidcClientController.redirectToIdp(
        res,
        body,
        sessionGenericServiceMock,
      );

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
      await oidcClientController.redirectToIdp(
        res,
        body,
        sessionGenericServiceMock,
      );

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
        oidcClientController.redirectToIdp(
          res,
          body,
          sessionGenericServiceMock,
        ),
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
      await oidcClientController.redirectToIdp(
        res,
        body,
        sessionGenericServiceMock,
      );

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
          oidcClientController.redirectToIdp(
            res,
            body,
            sessionGenericServiceMock,
          ),
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
        await oidcClientController.redirectToIdp(
          res,
          body,
          sessionGenericServiceMock,
        );

        // assert
        expect(sessionGenericServiceMock.get).toHaveBeenLastCalledWith();
        expect(res.redirect).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('getWellKnownKeys()', () => {
    it('should call oidc-client-service for wellKnownKeys', async () => {
      // When
      await oidcClientController.getWellKnownKeys();
      // Then
      expect(oidcClientServiceMock.utils.wellKnownKeys).toHaveBeenCalledTimes(
        1,
      );
    });
  });
});
