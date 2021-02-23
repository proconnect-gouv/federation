import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';
import { TrackingService } from '@fc/tracking';
import { ConfigService } from '@fc/config';
import { IDENTITY_PROVIDER_SERVICE, SERVICE_PROVIDER_SERVICE } from './tokens';
import { OidcClientController } from './oidc-client.controller';
import { OidcClientService } from './services';
import { OidcClientIdpBlacklistedException } from './exceptions';

describe('OidcClient Controller', () => {
  let oidcClientController: OidcClientController;
  let req;
  let res;

  const oidcClientServiceMock = {
    getAuthorizeUrl: jest.fn(),
    getTokenSet: jest.fn(),
    getUserInfo: jest.fn(),
    wellKnownKeys: jest.fn(),
    buildAuthorizeParameters: jest.fn(),
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

  const serviceProviderServiceMock = {
    shouldExcludeIdp: jest.fn(),
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
        {
          provide: SERVICE_PROVIDER_SERVICE,
          useValue: serviceProviderServiceMock,
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

    jest.resetAllMocks();

    identityProviderServiceMock.getById.mockReturnValue({ name: 'foo' });
    sessionServiceMock.get.mockResolvedValue({
      idpState: stateMock,
      idpNonce: nonceMock,
    });

    oidcClientServiceMock.buildAuthorizeParameters.mockReturnValue({
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

  describe('checkIdpBlacklisted', () => {
    it('should return OidcClientRuntimeException isIdpBlacklist throw an error', async () => {
      // setup
      const errorMock = new Error('Unknown Error');
      // action
      serviceProviderServiceMock.shouldExcludeIdp.mockRejectedValueOnce(
        errorMock,
      );

      // assert
      await expect(
        oidcClientController['checkIdpBlacklisted']('spId', 'idpId'),
      ).rejects.toThrow(errorMock);
    });

    it('should throw OidcClientIdpBlacklistedException because identity provider is blacklisted', async () => {
      // setup
      const errorMock = new OidcClientIdpBlacklistedException('spId', 'idpId');
      // action
      serviceProviderServiceMock.shouldExcludeIdp.mockReturnValueOnce(true);

      // assert
      await expect(
        oidcClientController['checkIdpBlacklisted']('spId', 'idpId'),
      ).rejects.toThrow(errorMock);
    });

    it('should return false because identity provider is not blacklisted', async () => {
      serviceProviderServiceMock.shouldExcludeIdp.mockReturnValueOnce(false);

      const result = await oidcClientController['checkIdpBlacklisted'](
        'spId',
        'idpId',
      );
      expect(result).toBeFalsy();
    });
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

      oidcClientServiceMock.getAuthorizeUrl.mockReturnValueOnce(
        mockedoidcClientService,
      );

      // action
      await oidcClientController.redirectToIdp(res, req, body);

      // assert
      expect(oidcClientServiceMock.getAuthorizeUrl).toHaveBeenCalledTimes(1);
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

      oidcClientServiceMock.getAuthorizeUrl.mockReturnValueOnce(
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
      serviceProviderServiceMock.shouldExcludeIdp.mockReturnValueOnce(true);

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
      expect(res.redirect).toHaveBeenCalledTimes(1);
    });

    describe('Idp blacklisted scenario for redirect to idp', () => {
      let isBlacklistedMock;
      beforeEach(() => {
        isBlacklistedMock = oidcClientController[
          'checkIdpBlacklisted'
        ] = jest.fn();
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
        await expect(
          oidcClientController.redirectToIdp(res, req, body),
        ).rejects.toThrow(errorMock);
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
        expect(res.redirect).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('getOidcCallback', () => {
    it('should call oidc-client-service for retrieve authorize url', async () => {
      // setup
      const accessToken = 'accest_token';
      const providerUid = 'foo';
      oidcClientServiceMock.getTokenSet.mockReturnValueOnce({
        // oidc spec defined property
        // eslint-disable-next-line @typescript-eslint/naming-convention
        access_token: 'accest_token',
        // oidc spec defined property
        // eslint-disable-next-line @typescript-eslint/naming-convention
        id_token: 'id_token',
        claims: jest.fn().mockReturnValueOnce({ acr: 'foo', arm: 'amr_value' }),
      });
      oidcClientServiceMock.getUserInfo.mockReturnValueOnce({
        sub: '1',
        // oidc spec defined property
        // eslint-disable-next-line @typescript-eslint/naming-convention
        given_name: 'given_name',
      });

      // action
      await oidcClientController.getOidcCallback(req, res, {
        providerUid,
      });

      // assert
      expect(oidcClientServiceMock.getTokenSet).toHaveBeenCalledTimes(1);
      expect(oidcClientServiceMock.getTokenSet).toHaveBeenCalledWith(
        req,
        providerUid,
        stateMock,
        nonceMock,
      );
      expect(oidcClientServiceMock.getUserInfo).toHaveBeenCalledTimes(1);
      expect(oidcClientServiceMock.getUserInfo).toHaveBeenCalledWith(
        accessToken,
        providerUid,
      );

      expect(res.redirect).toHaveBeenCalledTimes(1);
    });

    it('should resolve callback even if no spId are fetchable', async () => {
      // setup
      const providerUid = 'foo';
      oidcClientServiceMock.getTokenSet.mockReturnValueOnce({
        // oidc spec defined property
        // eslint-disable-next-line @typescript-eslint/naming-convention
        access_token: 'accest_token',
        // oidc spec defined property
        // eslint-disable-next-line @typescript-eslint/naming-convention
        id_token: 'id_token',
        claims: jest.fn().mockReturnValueOnce({ acr: 'foo' }),
      });

      oidcClientServiceMock.getUserInfo.mockReturnValueOnce({
        sub: '1',
        // oidc spec defined property
        // eslint-disable-next-line @typescript-eslint/naming-convention
        given_name: 'given_name',
      });

      sessionServiceMock.get.mockImplementationOnce(() => {
        throw new Error();
      });

      // action
      await oidcClientController.getOidcCallback(req, res, {
        providerUid,
      });

      // assert
      expect(res.redirect).toHaveBeenCalledTimes(1);
    });

    describe('Idp blacklisted scenario for get oidc callback', () => {
      let isBlacklistedMock;
      beforeEach(() => {
        isBlacklistedMock = oidcClientController[
          'checkIdpBlacklisted'
        ] = jest.fn();
        oidcClientServiceMock.getTokenSet.mockReturnValueOnce({
          // oidc spec defined property
          // eslint-disable-next-line @typescript-eslint/naming-convention
          access_token: 'accest_token',
          // oidc spec defined property
          // eslint-disable-next-line @typescript-eslint/naming-convention
          id_token: 'id_token',
          claims: jest.fn().mockReturnValueOnce({ acr: 'foo' }),
        });

        oidcClientServiceMock.getUserInfo.mockReturnValueOnce({
          sub: '1',
          // oidc spec defined property
          // eslint-disable-next-line @typescript-eslint/naming-convention
          given_name: 'given_name',
        });
      });

      it('idp is blacklisted', async () => {
        // setup
        const providerUid = 'foo';
        const errorMock = new Error('New Error');
        sessionServiceMock.get.mockReturnValueOnce({ spId: 'spIdValue' });
        isBlacklistedMock.mockRejectedValueOnce(errorMock);

        // action / assert
        await expect(
          oidcClientController.getOidcCallback(req, res, { providerUid }),
        ).rejects.toThrow(errorMock);
      });

      it('idp is not blacklisted', async () => {
        // setup
        const providerUid = 'foo';
        sessionServiceMock.get.mockReturnValueOnce({ spId: 'spIdValue' });
        isBlacklistedMock.mockReturnValueOnce(false);

        // action
        await oidcClientController.getOidcCallback(req, res, { providerUid });

        // assert
        expect(res.redirect).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('getWellKnownKeys', () => {
    it('should call oidc-client-service for wellKnownKeys', async () => {
      // When
      await oidcClientController.getWellKnownKeys();
      // Then
      expect(oidcClientServiceMock.wellKnownKeys).toHaveBeenCalledTimes(1);
    });
  });
});
