import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';
import { TrackingService } from '@fc/tracking';
import { ConfigService } from '@fc/config';
import { IDENTITY_PROVIDER_SERVICE } from './tokens';
import { OidcClientController } from './oidc-client.controller';
import { OidcClientService } from './services';

describe('OidcClient Controller', () => {
  let oidcClientController: OidcClientController;
  let req;
  let res;

  const oidcClientServiceMock = {
    utils: {
      getAuthorizeUrl: jest.fn(),
      wellKnownKeys: jest.fn(),
      buildAuthorizeParameters: jest.fn(),
      checkIdpBlacklisted: jest.fn(),
    },
  };

  const loggerServiceMock = ({
    setContext: jest.fn(),
    verbose: jest.fn(),
    debug: jest.fn(),
    businessEvent: jest.fn(),
  } as unknown) as LoggerService;

  const sessionServiceMock = {
    save: jest.fn(),
    patch: jest.fn(),
    get: jest.fn(),
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
        SessionService,
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
      .overrideProvider(SessionService)
      .useValue(sessionServiceMock)
      .overrideProvider(TrackingService)
      .useValue(trackingMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .compile();

    oidcClientController = module.get<OidcClientController>(
      OidcClientController,
    );

    res = {
      redirect: jest.fn(),
    };

    req = {
      fc: { interactionId: 'interactionIdMockValue' },
    };

    identityProviderServiceMock.getById.mockReturnValue({ name: 'foo' });
    sessionServiceMock.get.mockResolvedValue({
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
  });

  it('should be defined', () => {
    expect(oidcClientController).toBeDefined();
  });

  describe('redirectToIdp', () => {
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
      };

      const mockedoidcClientService =
        'https://my-authentication-openid-url.com';

      oidcClientServiceMock.utils.getAuthorizeUrl.mockReturnValueOnce(
        mockedoidcClientService,
      );

      // action
      await oidcClientController.redirectToIdp(res, req, body);

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
      };

      const mockedoidcClientService =
        'https://my-authentication-openid-url.com';

      oidcClientServiceMock.utils.getAuthorizeUrl.mockReturnValueOnce(
        mockedoidcClientService,
      );

      // action
      await oidcClientController.redirectToIdp(res, req, body);

      // assert
      expect(sessionServiceMock.patch).toHaveBeenCalledTimes(1);
      expect(sessionServiceMock.patch).toHaveBeenCalledWith(
        req.fc.interactionId,
        {
          idpId: body.providerUid,
          idpName: 'foo',
          idpState: stateMock,
          idpNonce: nonceMock,
        },
      );
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
      };
      sessionServiceMock.get.mockImplementationOnce(() => {
        throw new Error();
      });

      // action
      await oidcClientController.redirectToIdp(res, req, body);

      // assert
      expect(res.redirect).toHaveBeenCalledTimes(1);
    });

    it('should throw an error because idp is blacklisted', async () => {
      // setup
      const body = {
        scope: 'openid',
        providerUid: providerIdMock,
        // oidc param
        // eslint-disable-next-line @typescript-eslint/naming-convention
        acr_values: 'eidas3',
        nonce: nonceMock,
        claims: 'any_formatted_json_string',
      };
      sessionServiceMock.get.mockReturnValueOnce('spId');

      // action
      await oidcClientController.redirectToIdp(res, req, body);

      // assert
      expect(sessionServiceMock.get).toHaveBeenLastCalledWith(
        req.fc.interactionId,
      );
      expect(res.redirect).toHaveBeenCalledTimes(1);
    });

    describe('Idp blacklisted scenario for redirect to idp', () => {
      let isBlacklistedMock;
      beforeEach(() => {
        isBlacklistedMock = oidcClientServiceMock.utils.checkIdpBlacklisted = jest.fn();
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
        };
        const errorMock = new Error('New Error');
        sessionServiceMock.get.mockReturnValueOnce({ spId: 'spIdValue' });
        isBlacklistedMock.mockRejectedValueOnce(errorMock);

        // action / assert
        await expect(() =>
          oidcClientController.redirectToIdp(res, req, body),
        ).rejects.toThrow(errorMock);
        expect(sessionServiceMock.get).toHaveBeenLastCalledWith(
          req.fc.interactionId,
        );
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
        };
        sessionServiceMock.get.mockReturnValueOnce({ spId: 'spIdValue' });
        isBlacklistedMock.mockReturnValueOnce(false);

        // action
        await oidcClientController.redirectToIdp(res, req, body);

        // assert
        expect(sessionServiceMock.get).toHaveBeenLastCalledWith(
          req.fc.interactionId,
        );
        expect(res.redirect).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('getWellKnownKeys', () => {
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
