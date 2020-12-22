import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@fc/config';
import { CryptographyService } from '@fc/cryptography';
import { OidcClientService } from '@fc/oidc-client';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';
import { OidcProviderService } from '@fc/oidc-provider';
import { EidasBridgeController } from './eidas-bridge.controller';
import { EidasToOidcService, OidcToEidasService } from '@fc/eidas-oidc-mapper';
import { AcrValues } from '@fc/oidc';
import { EidasAttributes } from '@fc/eidas';

describe('EidasBridgeController', () => {
  let eidasBridgeController: EidasBridgeController;

  const configServiceMock = {
    get: jest.fn(),
  };

  const appConfigMock = {
    urlPrefix: '/api/v2',
    scope: 'openid given_name',
  };

  const oidcClientServiceMock = {
    getAuthorizeUrl: jest.fn(),
    getTokenSet: jest.fn(),
    getUserInfo: jest.fn(),
    wellKnownKeys: jest.fn(),
    buildAuthorizeParameters: jest.fn(),
  };

  const oidcProviderServiceMock = {
    getInteraction: jest.fn(),
    finishInteraction: jest.fn(),
  };

  const loggerServiceMock = ({
    setContext: jest.fn(),
  } as unknown) as LoggerService;

  const eidasToOidcServiceMock = {
    mapPartialRequest: jest.fn(),
  };

  const oidcToEidasServiceMock = {
    mapSuccessPartialResponse: jest.fn(),
    mapFailurePartialResponse: jest.fn(),
  };

  const sessionMock = {
    patch: jest.fn(),
    get: jest.fn(),
    init: jest.fn(),
    getId: jest.fn(),
  };

  const exposedSessionMock = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const oidcErrorMock = {
    error: 'error',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    error_description: 'error_description',
  };

  const acrMock = 'eidas2';
  const scopeMock = 'scopeMock';
  const providerUidMock = 'corev2';
  const randomStringMock = 'randomStringMockValue';
  const stateMock = randomStringMock;
  const nonceMock = randomStringMock;
  const sessionIdMock = randomStringMock;

  const cryptographyMock = {
    genRandomString: jest.fn(),
  };

  const sessionMockValue = {
    spName: Symbol('spNameMockValue'),
  };

  const res = {
    redirect: jest.fn(),
  };

  const req = {
    body: {
      country: 'BE',
    },
    fc: {
      interactionId: 'interactionIdMock',
    },
    params: {
      uid: '1234456',
    },
  };

  const interactionMock = {
    uid: Symbol('uidMockValue'),
    params: Symbol('paramsMockValue'),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [EidasBridgeController],
      providers: [
        ConfigService,
        OidcClientService,
        LoggerService,
        SessionService,
        CryptographyService,
        OidcProviderService,
        EidasToOidcService,
        OidcToEidasService,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(OidcClientService)
      .useValue(oidcClientServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(SessionService)
      .useValue(sessionMock)
      .overrideProvider(CryptographyService)
      .useValue(cryptographyMock)
      .overrideProvider(OidcProviderService)
      .useValue(oidcProviderServiceMock)
      .overrideProvider(EidasToOidcService)
      .useValue(eidasToOidcServiceMock)
      .overrideProvider(OidcToEidasService)
      .useValue(oidcToEidasServiceMock)

      .compile();

    eidasBridgeController = await app.get<EidasBridgeController>(
      EidasBridgeController,
    );

    jest.resetAllMocks();
    configServiceMock.get.mockReturnValue(appConfigMock);

    oidcClientServiceMock.buildAuthorizeParameters.mockReturnValue({
      state: stateMock,
      scope: scopeMock,
      providerUid: providerUidMock,
      // oidc parameter
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: acrMock,
    });

    oidcProviderServiceMock.getInteraction.mockResolvedValue(interactionMock);
    sessionMock.get.mockResolvedValue(sessionMockValue);
    sessionMock.getId.mockReturnValue(sessionIdMock);

    cryptographyMock.genRandomString.mockReturnValue(randomStringMock);
  });

  describe('initSession', () => {
    it('Should generate a random sessionId of 32 characters', async () => {
      // setup
      sessionMock.init.mockResolvedValueOnce(undefined);

      // action
      const randSize = 32;
      await eidasBridgeController.initSession(res);

      // assert
      expect(cryptographyMock.genRandomString).toHaveBeenCalledTimes(1);
      expect(cryptographyMock.genRandomString).toHaveBeenCalledWith(randSize);
    });

    it('Should init the session', async () => {
      // setup
      sessionMock.init.mockResolvedValueOnce(undefined);

      // action
      await eidasBridgeController.initSession(res);

      // assert
      expect(sessionMock.init).toHaveBeenCalledTimes(1);
      expect(sessionMock.init).toHaveBeenCalledWith(res, randomStringMock, {
        idpState: randomStringMock,
      });
    });

    it('should return the redirect url with a 302 status code', async () => {
      // setup
      const expected = {
        url: '/oidc-client/redirect-to-fc-authorize',
        statusCode: 302,
      };

      // action
      const result = await eidasBridgeController.initSession(res);

      // expect
      expect(result).toEqual(expected);
    });
  });

  describe('redirectToFcAuthorize', () => {
    const eidasRequestMock = {
      id: 'id',
      relayState: 'relayState',
      levelOfAssurance: 'levelOfAssurance',
    };
    const oidcRequestMock = {
      // oidc parameter
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: AcrValues.EIDAS2,
      scope: ['openid', 'given_name'],
    };
    const authorizeUrlMock = 'https://my-authentication-openid-url.com';

    const mapPartialRequestMock = jest.fn();

    beforeEach(() => {
      exposedSessionMock.get.mockResolvedValueOnce(eidasRequestMock);
      eidasToOidcServiceMock.mapPartialRequest = mapPartialRequestMock.mockReturnValueOnce(
        oidcRequestMock,
      );
      oidcClientServiceMock.getAuthorizeUrl.mockReturnValueOnce(
        authorizeUrlMock,
      );
    });

    it('Should get the eidas request from the session', async () => {
      // setup
      sessionMock.patch.mockResolvedValueOnce('randomStringMockValue');

      // action
      await eidasBridgeController.redirectToFcAuthorize(
        req,
        exposedSessionMock,
      );

      // assert
      expect(exposedSessionMock.get).toHaveBeenCalledTimes(1);
      expect(exposedSessionMock.get).toHaveBeenCalledWith('eidasRequest');
    });

    it('Should map the eidas request to oidc request', async () => {
      // setup
      sessionMock.patch.mockResolvedValueOnce('randomStringMockValue');

      // action
      await eidasBridgeController.redirectToFcAuthorize(
        req,
        exposedSessionMock,
      );

      // assert
      expect(eidasToOidcServiceMock.mapPartialRequest).toHaveBeenCalledTimes(1);
      expect(eidasToOidcServiceMock.mapPartialRequest).toHaveBeenCalledWith(
        eidasRequestMock,
      );
    });

    it('Should build the authorize parameters with the oidc params', async () => {
      // setup
      const oidcParamsMock = {
        providerUid: 'corev2',
        // oidc parameter
        // eslint-disable-next-line @typescript-eslint/naming-convention
        acr_values: oidcRequestMock.acr_values,
        scope: oidcRequestMock.scope.join(' '),
      };
      sessionMock.patch.mockResolvedValueOnce('randomStringMockValue');

      // action
      await eidasBridgeController.redirectToFcAuthorize(
        req,
        exposedSessionMock,
      );

      // assert
      expect(
        oidcClientServiceMock.buildAuthorizeParameters,
      ).toHaveBeenCalledTimes(1);
      expect(
        oidcClientServiceMock.buildAuthorizeParameters,
      ).toHaveBeenCalledWith(oidcParamsMock);
    });

    it('Should call oidc-client-service for retrieve authorize url', async () => {
      const authorizeParametersMock = {
        state: 'state',
        scope: oidcRequestMock.scope.join(' '),
        providerUid: 'corev2',
        // acr_values is an oidc defined variable name
        // eslint-disable-next-line @typescript-eslint/naming-convention
        acr_values: oidcRequestMock.acr_values,
        nonce: nonceMock,
      };
      oidcClientServiceMock.buildAuthorizeParameters.mockResolvedValueOnce(
        authorizeParametersMock,
      );
      sessionMock.patch.mockResolvedValueOnce('randomStringMockValue');

      // action
      await eidasBridgeController.redirectToFcAuthorize(
        req,
        exposedSessionMock,
      );

      // assert
      expect(oidcClientServiceMock.getAuthorizeUrl).toHaveBeenCalledTimes(1);
      expect(oidcClientServiceMock.getAuthorizeUrl).toHaveBeenCalledWith(
        authorizeParametersMock.state,
        authorizeParametersMock.scope,
        authorizeParametersMock.providerUid,
        authorizeParametersMock.acr_values,
        authorizeParametersMock.nonce,
      );
    });

    it('Should get the session id', async () => {
      sessionMock.patch.mockResolvedValueOnce(undefined);

      // action
      await eidasBridgeController.redirectToFcAuthorize(
        req,
        exposedSessionMock,
      );

      // expect
      expect(sessionMock.getId).toHaveBeenCalledTimes(1);
      expect(sessionMock.getId).toHaveBeenCalledWith(req);
    });

    it('Should patch the session', async () => {
      sessionMock.patch.mockResolvedValueOnce(undefined);

      // action
      await eidasBridgeController.redirectToFcAuthorize(
        req,
        exposedSessionMock,
      );

      // expect
      expect(sessionMock.patch).toHaveBeenCalledTimes(1);
      expect(sessionMock.patch).toHaveBeenCalledWith(sessionIdMock, {
        idpState: stateMock,
      });
    });

    it("Should throw if the session can't be patched", async () => {
      sessionMock.patch.mockRejectedValueOnce(new Error('test'));

      // expect
      await expect(
        eidasBridgeController.redirectToFcAuthorize(req, exposedSessionMock),
      ).rejects.toThrow();
    });

    it('Should return the authorize url with a 302 status code', async () => {
      // setup
      const expected = { statusCode: 302, url: authorizeUrlMock };
      sessionMock.patch.mockResolvedValueOnce(undefined);

      // action
      const result = await eidasBridgeController.redirectToFcAuthorize(
        req,
        exposedSessionMock,
      );

      // expect
      expect(result).toStrictEqual(expected);
    });
  });

  describe('redirectToEidasResponseProxy', () => {
    describe('query contains an oidc error', () => {
      const query = { ...oidcErrorMock };

      it('should call mapFailurePartialResponse', async () => {
        // action
        await eidasBridgeController.redirectToEidasResponseProxy(
          req,
          query,
          exposedSessionMock,
        );

        // expect
        expect(
          oidcToEidasServiceMock.mapFailurePartialResponse,
        ).toHaveBeenCalledTimes(1);
        expect(
          oidcToEidasServiceMock.mapFailurePartialResponse,
        ).toHaveBeenCalledWith(oidcErrorMock);
      });

      it('should set the session with the eidas partial failure reponse', async () => {
        // setup
        const eidasPartialFailureResponseMock = {
          status: {
            failure: true,
          },
        };
        oidcToEidasServiceMock.mapFailurePartialResponse.mockReturnValueOnce(
          eidasPartialFailureResponseMock,
        );

        // action
        await eidasBridgeController.redirectToEidasResponseProxy(
          req,
          query,
          exposedSessionMock,
        );

        // expect
        expect(exposedSessionMock.set).toHaveBeenCalledTimes(1);
        expect(exposedSessionMock.set).toHaveBeenCalledWith(
          'partialEidasResponse',
          eidasPartialFailureResponseMock,
        );
      });

      it('should return the eidas client response proxy url alongside a 302 status code', async () => {
        // setup
        const expected = {
          statusCode: 302,
          url: '/eidas-provider/response-proxy',
        };

        // action
        const result = await eidasBridgeController.redirectToEidasResponseProxy(
          req,
          query,
          exposedSessionMock,
        );

        // expect
        expect(result).toStrictEqual(expected);
      });
    });

    describe('query does not contains an error', () => {
      const query = {};
      const idpStateMock = 'hahaha';
      const tokenSetMock = {
        claims: jest.fn(),
        // oidc parameter
        // eslint-disable-next-line @typescript-eslint/naming-convention
        access_token: 'access_token',
      };
      const claimsMock = {
        acr: AcrValues.EIDAS2,
      };
      const requestedAttributesMock = [EidasAttributes.PERSON_IDENTIFIER];

      beforeEach(() => {
        sessionMock.get.mockResolvedValueOnce({
          idpState: idpStateMock,
        });
        exposedSessionMock.get.mockResolvedValueOnce({
          requestedAttributes: requestedAttributesMock,
        });
        oidcClientServiceMock.getTokenSet.mockResolvedValueOnce(tokenSetMock);
        tokenSetMock.claims.mockReturnValueOnce(claimsMock);
      });

      it('should retrieve the session id', async () => {
        // action
        await eidasBridgeController.redirectToEidasResponseProxy(
          req,
          query,
          exposedSessionMock,
        );

        // expect
        expect(sessionMock.getId).toHaveBeenCalledTimes(1);
        expect(sessionMock.getId).toHaveBeenCalledWith(req);
      });

      it('should get the session with the session id', async () => {
        // action
        await eidasBridgeController.redirectToEidasResponseProxy(
          req,
          query,
          exposedSessionMock,
        );

        // expect
        expect(sessionMock.get).toHaveBeenCalledTimes(1);
        expect(sessionMock.get).toHaveBeenCalledWith(sessionIdMock);
      });

      it('should get the token set from the idp', async () => {
        // action
        await eidasBridgeController.redirectToEidasResponseProxy(
          req,
          query,
          exposedSessionMock,
        );

        // expect
        expect(oidcClientServiceMock.getTokenSet).toHaveBeenCalledTimes(1);
        expect(oidcClientServiceMock.getTokenSet).toHaveBeenCalledWith(
          req,
          providerUidMock,
          idpStateMock,
        );
      });

      it('should get claims from the token set', async () => {
        // action
        await eidasBridgeController.redirectToEidasResponseProxy(
          req,
          query,
          exposedSessionMock,
        );

        // expect
        expect(tokenSetMock.claims).toHaveBeenCalledTimes(1);
        expect(tokenSetMock.claims).toHaveBeenCalledWith();
      });

      it('should get the user infos with the access token from the token set', async () => {
        // action
        await eidasBridgeController.redirectToEidasResponseProxy(
          req,
          query,
          exposedSessionMock,
        );

        // expect
        expect(oidcClientServiceMock.getUserInfo).toHaveBeenCalledTimes(1);
        expect(oidcClientServiceMock.getUserInfo).toHaveBeenCalledWith(
          tokenSetMock.access_token,
          providerUidMock,
        );
      });

      it('should get the eidas request from the session', async () => {
        // action
        await eidasBridgeController.redirectToEidasResponseProxy(
          req,
          query,
          exposedSessionMock,
        );

        // expect
        expect(exposedSessionMock.get).toHaveBeenCalledTimes(1);
        expect(exposedSessionMock.get).toHaveBeenCalledWith('eidasRequest');
      });

      it('should call mapSuccessPartialResponse with the idp identity, the idp acr and the requested eidas attributes', async () => {
        // setup
        const userInfosMock = {
          sub: 'sub',
        };
        oidcClientServiceMock.getUserInfo.mockResolvedValueOnce(userInfosMock);

        // action
        await eidasBridgeController.redirectToEidasResponseProxy(
          req,
          query,
          exposedSessionMock,
        );

        // expect
        expect(
          oidcToEidasServiceMock.mapSuccessPartialResponse,
        ).toHaveBeenCalledTimes(1);
        expect(
          oidcToEidasServiceMock.mapSuccessPartialResponse,
        ).toHaveBeenCalledWith(userInfosMock, acrMock, requestedAttributesMock);
      });

      it('should set the session with the eidas partial reponse', async () => {
        // setup
        const eidasPartialResponseMock = {
          status: {
            failure: false,
          },
        };
        oidcToEidasServiceMock.mapSuccessPartialResponse.mockReturnValueOnce(
          eidasPartialResponseMock,
        );

        // action
        await eidasBridgeController.redirectToEidasResponseProxy(
          req,
          query,
          exposedSessionMock,
        );

        // expect
        expect(exposedSessionMock.set).toHaveBeenCalledTimes(1);
        expect(exposedSessionMock.set).toHaveBeenCalledWith(
          'partialEidasResponse',
          eidasPartialResponseMock,
        );
      });

      it('should return the eidas client response proxy url alongside a 302 status code', async () => {
        // setup
        const expected = {
          statusCode: 302,
          url: '/eidas-provider/response-proxy',
        };

        // action
        const result = await eidasBridgeController.redirectToEidasResponseProxy(
          req,
          query,
          exposedSessionMock,
        );

        // expect
        expect(result).toStrictEqual(expected);
      });

      it('should call mapFailurePartialResponse with the error if an oidc call rejects', async () => {
        // setup
        const errorMock = new Error('oops');
        oidcClientServiceMock.getUserInfo.mockRejectedValueOnce(errorMock);

        // action
        await eidasBridgeController.redirectToEidasResponseProxy(
          req,
          query,
          exposedSessionMock,
        );

        // expect
        expect(
          oidcToEidasServiceMock.mapFailurePartialResponse,
        ).toHaveBeenCalledTimes(1);
        expect(
          oidcToEidasServiceMock.mapFailurePartialResponse,
        ).toHaveBeenCalledWith(errorMock);
      });

      it('should set the session with the eidas partial failure reponse if an oidc call rejects', async () => {
        // setup
        const errorMock = new Error('oops');
        oidcClientServiceMock.getUserInfo.mockRejectedValueOnce(errorMock);
        const eidasPartialFailureResponseMock = {
          status: {
            failure: true,
          },
        };
        oidcToEidasServiceMock.mapFailurePartialResponse.mockReturnValueOnce(
          eidasPartialFailureResponseMock,
        );

        // action
        await eidasBridgeController.redirectToEidasResponseProxy(
          req,
          query,
          exposedSessionMock,
        );

        // expect
        expect(exposedSessionMock.set).toHaveBeenCalledTimes(1);
        expect(exposedSessionMock.set).toHaveBeenCalledWith(
          'partialEidasResponse',
          eidasPartialFailureResponseMock,
        );
      });
    });
  });

  describe('getInteraction', () => {
    it('should call oidcProvider.getInteraction', async () => {
      // When
      await eidasBridgeController.getInteraction(req, res);

      // Then
      expect(oidcProviderServiceMock.getInteraction).toBeCalledTimes(1);
      expect(oidcProviderServiceMock.getInteraction).toBeCalledWith(req, res);
    });

    it('should call get the country list from the config', async () => {
      // When
      await eidasBridgeController.getInteraction(req, res);

      // Then
      expect(configServiceMock.get).toBeCalledTimes(1);
      expect(configServiceMock.get).toBeCalledWith('Core');
    });

    it('should call session.get with interactionId', async () => {
      // When
      await eidasBridgeController.getInteraction(req, res);

      // Then
      expect(sessionMock.get).toBeCalledTimes(1);
      expect(sessionMock.get).toBeCalledWith(req.fc.interactionId);
    });

    it('should return an object with data from session and oidcProvider interaction', async () => {
      // setup
      const countryListMock = [{ iso: 'ATL', name: 'Atlantis' }];
      configServiceMock.get.mockReturnValueOnce({
        countryList: countryListMock,
      });

      // action
      const result = await eidasBridgeController.getInteraction(req, res);

      // expect
      expect(result).toStrictEqual({
        uid: interactionMock.uid,
        countryList: countryListMock,
        params: interactionMock.params,
        spName: sessionMockValue.spName,
      });
    });
  });

  describe('redirectToFrNodeConnector', () => {
    it('should return a status code and a url', async () => {
      // When
      const result = await eidasBridgeController.redirectToFrNodeConnector(
        req.body,
      );
      // Then
      expect(result).toEqual({
        statusCode: 302,
        url: '/eidas-client/redirect-to-fr-node-connector?country=BE',
      });
    });
  });
});
