import { mocked } from 'ts-jest/utils';
import { Test, TestingModule } from '@nestjs/testing';
import { CryptographyService } from '@fc/cryptography';
import { OidcClientService } from '@fc/oidc-client';
import { LoggerService } from '@fc/logger';
import { SessionGenericService } from '@fc/session-generic';
import { EidasToOidcService, OidcToEidasService } from '@fc/eidas-oidc-mapper';
import { AcrValues } from '@fc/oidc';
import { EidasAttributes } from '@fc/eidas';
import { validateDto } from '@fc/common';
import { EidasBridgeInvalidIdentityException } from '../exceptions';
import { EidasBridgeIdentityDto } from '../dto';
import { FrIdentityToEuController } from './fr-identity-to-eu.controller';

jest.mock('@fc/common', () => ({
  ...jest.requireActual('@fc/common'),
  validateDto: jest.fn(),
}));

describe('FrIdentityToEuController', () => {
  let frIdentityToEuController: FrIdentityToEuController;

  const oidcClientServiceMock = {
    utils: {
      getAuthorizeUrl: jest.fn(),
      getTokenSet: jest.fn(),
      getUserInfo: jest.fn(),
      wellKnownKeys: jest.fn(),
      buildAuthorizeParameters: jest.fn(),
    },
    getTokenFromProvider: jest.fn(),
    getUserInfosFromProvider: jest.fn(),
  };

  const loggerServiceMock = ({
    setContext: jest.fn(),
  } as unknown) as LoggerService;

  const eidasToOidcServiceMock = {
    mapPartialRequest: jest.fn(),
  };

  const oidcToEidasServiceMock = {
    mapPartialResponseSuccess: jest.fn(),
    mapPartialResponseFailure: jest.fn(),
  };

  const sessionServiceOidcMock = {
    set: jest.fn(),
    get: jest.fn(),
    getId: jest.fn(),
  };

  const sessionServiceEidasMock = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const oidcErrorMock = {
    error: 'error',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    error_description: 'error_description',
  };

  const interactionIdMock = 'interactionIdMockValue';
  const acrMock = 'eidas2';
  const scopeMock = 'scopeMock';
  const providerUidMock = 'envIssuer';
  const randomStringMock = 'randomStringMockValue';
  const stateMock = randomStringMock;
  const sessionIdMock = randomStringMock;
  const idpStateMock = 'idpStateMockValue';
  const idpNonceMock = 'idpNonceMockValue';

  const cryptographyMock = {
    genRandomString: jest.fn(),
  };

  const sessionMockValue = {
    spName: Symbol('spNameMockValue'),
  };

  const req = {
    body: {
      country: 'BE',
    },
    fc: {
      interactionId: interactionIdMock,
    },
    params: {
      uid: '1234456',
    },
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [FrIdentityToEuController],
      providers: [
        OidcClientService,
        LoggerService,
        SessionGenericService,
        CryptographyService,
        EidasToOidcService,
        OidcToEidasService,
      ],
    })
      .overrideProvider(OidcClientService)
      .useValue(oidcClientServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(SessionGenericService)
      .useValue(sessionServiceOidcMock)
      .overrideProvider(CryptographyService)
      .useValue(cryptographyMock)
      .overrideProvider(EidasToOidcService)
      .useValue(eidasToOidcServiceMock)
      .overrideProvider(OidcToEidasService)
      .useValue(oidcToEidasServiceMock)
      .compile();

    frIdentityToEuController = await app.get<FrIdentityToEuController>(
      FrIdentityToEuController,
    );

    jest.resetAllMocks();
    jest.restoreAllMocks();

    oidcClientServiceMock.utils.buildAuthorizeParameters.mockReturnValue({
      state: stateMock,
      scope: scopeMock,
      providerUid: providerUidMock,
      // oidc parameter
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: acrMock,
    });

    sessionServiceOidcMock.get.mockResolvedValue(sessionMockValue);
    sessionServiceOidcMock.getId.mockReturnValue(sessionIdMock);

    cryptographyMock.genRandomString.mockReturnValue(randomStringMock);
  });

  describe('initSession', () => {
    it('Should generate a random sessionId of 32 characters', async () => {
      // setup
      sessionServiceOidcMock.set.mockResolvedValueOnce(undefined);

      // action
      const randSize = 32;
      await frIdentityToEuController.initSession(sessionServiceOidcMock);

      // assert
      expect(cryptographyMock.genRandomString).toHaveBeenCalledTimes(1);
      expect(cryptographyMock.genRandomString).toHaveBeenCalledWith(randSize);
    });

    it('Should init the session', async () => {
      // setup
      sessionServiceOidcMock.set.mockResolvedValueOnce(undefined);

      // action
      await frIdentityToEuController.initSession(sessionServiceOidcMock);

      // assert
      expect(sessionServiceOidcMock.set).toHaveBeenCalledTimes(1);
      expect(sessionServiceOidcMock.set).toHaveBeenCalledWith({
        sessionId: randomStringMock,
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
      const result = await frIdentityToEuController.initSession(
        sessionServiceOidcMock,
      );

      // expect
      expect(result).toEqual(expected);
    });
  });

  describe('redirectToFcAuthorize()', () => {
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
      sessionServiceEidasMock.get.mockResolvedValueOnce({
        eidasRequest: eidasRequestMock,
      });
      eidasToOidcServiceMock.mapPartialRequest = mapPartialRequestMock.mockReturnValueOnce(
        oidcRequestMock,
      );
      oidcClientServiceMock.utils.getAuthorizeUrl.mockReturnValueOnce(
        authorizeUrlMock,
      );
    });

    it('Should get the eidas request from the session', async () => {
      // setup
      sessionServiceOidcMock.set.mockResolvedValueOnce('randomStringMockValue');
      // action
      await frIdentityToEuController.redirectToFcAuthorize(
        sessionServiceOidcMock,
        sessionServiceEidasMock,
      );

      // assert
      expect(sessionServiceEidasMock.get).toHaveBeenCalledTimes(1);
      expect(sessionServiceEidasMock.get).toHaveBeenCalledWith();
    });

    it('Should map eIdas request to Oidc request', async () => {
      // Given
      // When
      await frIdentityToEuController.redirectToFcAuthorize(
        sessionServiceOidcMock,
        sessionServiceEidasMock,
      );
      // Then
      expect(eidasToOidcServiceMock.mapPartialRequest).toHaveBeenCalledTimes(1);
      expect(eidasToOidcServiceMock.mapPartialRequest).toHaveBeenCalledWith(
        eidasRequestMock,
      );
    });

    it('Should build the authorize parameters with the oidc params', async () => {
      sessionServiceOidcMock.set.mockResolvedValueOnce('randomStringMockValue');

      // action
      await frIdentityToEuController.redirectToFcAuthorize(
        sessionServiceOidcMock,
        sessionServiceEidasMock,
      );

      // assert
      expect(
        oidcClientServiceMock.utils.buildAuthorizeParameters,
      ).toHaveBeenCalledTimes(1);
      expect(
        oidcClientServiceMock.utils.buildAuthorizeParameters,
      ).toHaveBeenCalledWith();
    });

    it('Should call oidc-client-service for retrieve authorize url', async () => {
      const authorizeParametersMock = {
        state: 'state',
        scope: oidcRequestMock.scope.join(' '),
        providerUid: 'envIssuer',
        // acr_values is an oidc defined variable name
        // eslint-disable-next-line @typescript-eslint/naming-convention
        acr_values: oidcRequestMock.acr_values,
        nonce: idpNonceMock,
      };
      oidcClientServiceMock.utils.buildAuthorizeParameters.mockResolvedValueOnce(
        authorizeParametersMock,
      );
      sessionServiceOidcMock.set.mockResolvedValueOnce('randomStringMockValue');

      // action
      await frIdentityToEuController.redirectToFcAuthorize(
        sessionServiceOidcMock,
        sessionServiceEidasMock,
      );

      // assert
      expect(oidcClientServiceMock.utils.getAuthorizeUrl).toHaveBeenCalledTimes(
        1,
      );
      expect(oidcClientServiceMock.utils.getAuthorizeUrl).toHaveBeenCalledWith({
        state: authorizeParametersMock.state,
        scope: authorizeParametersMock.scope,
        providerUid: authorizeParametersMock.providerUid,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        acr_values: authorizeParametersMock.acr_values,
        nonce: authorizeParametersMock.nonce,
      });
    });

    it('Should patch the session', async () => {
      sessionServiceOidcMock.set.mockResolvedValueOnce(undefined);

      // action
      await frIdentityToEuController.redirectToFcAuthorize(
        sessionServiceOidcMock,
        sessionServiceEidasMock,
      );

      // expect
      expect(sessionServiceOidcMock.set).toHaveBeenCalledTimes(1);
      expect(sessionServiceOidcMock.set).toHaveBeenCalledWith({
        idpState: stateMock,
      });
    });

    it("Should throw if the session can't be patched", async () => {
      sessionServiceOidcMock.set.mockRejectedValueOnce(new Error('test'));

      // expect
      await expect(
        frIdentityToEuController.redirectToFcAuthorize(
          sessionServiceOidcMock,
          sessionServiceEidasMock,
        ),
      ).rejects.toThrow();
    });

    it('Should return the authorize url with a 302 status code', async () => {
      // setup
      const expected = { statusCode: 302, url: authorizeUrlMock };
      sessionServiceOidcMock.set.mockResolvedValueOnce(undefined);

      // action
      const result = await frIdentityToEuController.redirectToFcAuthorize(
        sessionServiceOidcMock,
        sessionServiceEidasMock,
      );

      // expect
      expect(result).toStrictEqual(expected);
    });
  });

  describe('redirectToEidasResponseProxy', () => {
    describe('query contains an oidc error', () => {
      const query = { ...oidcErrorMock };

      it('should call mapPartialResponseFailure', async () => {
        // action
        await frIdentityToEuController.redirectToEidasResponseProxy(
          req,
          query,
          sessionServiceEidasMock,
          sessionServiceOidcMock,
        );

        // expect
        expect(
          oidcToEidasServiceMock.mapPartialResponseFailure,
        ).toHaveBeenCalledTimes(1);
        expect(
          oidcToEidasServiceMock.mapPartialResponseFailure,
        ).toHaveBeenCalledWith(oidcErrorMock);
      });

      it('should set the session with the eidas partial failure reponse', async () => {
        // setup
        const eidasPartialFailureResponseMock = {
          status: {
            failure: true,
          },
        };
        oidcToEidasServiceMock.mapPartialResponseFailure.mockReturnValueOnce(
          eidasPartialFailureResponseMock,
        );

        // action
        await frIdentityToEuController.redirectToEidasResponseProxy(
          req,
          query,
          sessionServiceEidasMock,
          sessionServiceOidcMock,
        );

        // expect
        expect(sessionServiceEidasMock.set).toHaveBeenCalledTimes(1);
        expect(sessionServiceEidasMock.set).toHaveBeenCalledWith(
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
        const result = await frIdentityToEuController.redirectToEidasResponseProxy(
          req,
          query,
          sessionServiceEidasMock,
          sessionServiceOidcMock,
        );

        // expect
        expect(result).toStrictEqual(expected);
      });
    });

    describe('query does not contains an error', () => {
      const query = {};
      const requestedAttributesMock = [EidasAttributes.PERSON_IDENTIFIER];

      const tokenParamsMock = {
        providerUid: providerUidMock,
        idpState: idpStateMock,
        idpNonce: idpNonceMock,
      };

      let accessTokenMock;
      let validateIdentityMock;
      beforeEach(() => {
        sessionServiceOidcMock.get.mockResolvedValueOnce({
          idpState: idpStateMock,
          idpNonce: idpNonceMock,
        });
        sessionServiceEidasMock.get.mockResolvedValueOnce({
          requestedAttributes: requestedAttributesMock,
        });

        accessTokenMock = Symbol('accessTokenMock');

        oidcClientServiceMock.getTokenFromProvider.mockResolvedValueOnce({
          accessToken: accessTokenMock,
          acr: acrMock,
        });

        validateIdentityMock = jest.spyOn<FrIdentityToEuController, any>(
          frIdentityToEuController,
          'validateIdentity',
        );
        validateIdentityMock.mockResolvedValueOnce();
      });

      it('should get the session with the session id', async () => {
        // action
        await frIdentityToEuController.redirectToEidasResponseProxy(
          req,
          query,
          sessionServiceEidasMock,
          sessionServiceOidcMock,
        );

        // expect
        expect(sessionServiceOidcMock.get).toHaveBeenCalledTimes(1);
        expect(sessionServiceOidcMock.get).toHaveBeenCalledWith();
      });

      it('should get the token set from the idp', async () => {
        // action
        await frIdentityToEuController.redirectToEidasResponseProxy(
          req,
          query,
          sessionServiceEidasMock,
          sessionServiceOidcMock,
        );

        expect(
          oidcClientServiceMock.getTokenFromProvider,
        ).toHaveBeenCalledTimes(1);

        expect(oidcClientServiceMock.getTokenFromProvider).toHaveBeenCalledWith(
          tokenParamsMock,
          req,
        );
      });

      it('should get userInfo from token response', async () => {
        const userInfoParamsMock = {
          accessToken: accessTokenMock,
          providerUid: providerUidMock,
        };

        // action
        await frIdentityToEuController.redirectToEidasResponseProxy(
          req,
          query,
          sessionServiceEidasMock,
          sessionServiceOidcMock,
        );

        // expect
        expect(
          oidcClientServiceMock.getUserInfosFromProvider,
        ).toHaveBeenCalledTimes(1);
        expect(
          oidcClientServiceMock.getUserInfosFromProvider,
        ).toHaveBeenCalledWith(userInfoParamsMock, req);
      });

      it('should get the eidas request from the session for userinfo', async () => {
        // action
        await frIdentityToEuController.redirectToEidasResponseProxy(
          req,
          query,
          sessionServiceEidasMock,
          sessionServiceOidcMock,
        );

        // expect
        expect(sessionServiceEidasMock.get).toHaveBeenCalledTimes(1);
        expect(sessionServiceEidasMock.get).toHaveBeenCalledWith(
          'eidasRequest',
        );
      });

      it('should call mapPartialResponseSuccess with the idp identity, the idp acr and the requested eidas attributes', async () => {
        // setup
        const userInfosMock = {
          sub: 'sub',
        };
        oidcClientServiceMock.getUserInfosFromProvider.mockResolvedValueOnce(
          userInfosMock,
        );

        // action
        await frIdentityToEuController.redirectToEidasResponseProxy(
          req,
          query,
          sessionServiceEidasMock,
          sessionServiceOidcMock,
        );

        // expect
        expect(
          oidcToEidasServiceMock.mapPartialResponseSuccess,
        ).toHaveBeenCalledTimes(1);
        expect(
          oidcToEidasServiceMock.mapPartialResponseSuccess,
        ).toHaveBeenCalledWith(userInfosMock, acrMock, requestedAttributesMock);
      });

      it('should set the session with the eidas partial reponse', async () => {
        // setup
        const eidasPartialResponseMock = {
          status: {
            failure: false,
          },
        };
        oidcToEidasServiceMock.mapPartialResponseSuccess.mockReturnValueOnce(
          eidasPartialResponseMock,
        );

        // action
        await frIdentityToEuController.redirectToEidasResponseProxy(
          req,
          query,
          sessionServiceEidasMock,
          sessionServiceOidcMock,
        );

        // expect
        expect(sessionServiceEidasMock.set).toHaveBeenCalledTimes(1);
        expect(sessionServiceEidasMock.set).toHaveBeenCalledWith(
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
        const result = await frIdentityToEuController.redirectToEidasResponseProxy(
          req,
          query,
          sessionServiceEidasMock,
          sessionServiceOidcMock,
        );

        // expect
        expect(result).toStrictEqual(expected);
      });

      it('should call mapPartialResponseFailure with the error if an oidc call rejects', async () => {
        // setup
        const errorMock = new Error('oops');
        oidcClientServiceMock.getUserInfosFromProvider.mockRejectedValueOnce(
          errorMock,
        );

        // action
        await frIdentityToEuController.redirectToEidasResponseProxy(
          req,
          query,
          sessionServiceEidasMock,
          sessionServiceOidcMock,
        );

        // expect
        expect(
          oidcToEidasServiceMock.mapPartialResponseFailure,
        ).toHaveBeenCalledTimes(1);
        expect(
          oidcToEidasServiceMock.mapPartialResponseFailure,
        ).toHaveBeenCalledWith(errorMock);
      });

      it('should set the session with the eidas partial failure reponse if an oidc call rejects', async () => {
        // setup
        const errorMock = new Error('oops');
        oidcClientServiceMock.getUserInfosFromProvider.mockRejectedValueOnce(
          errorMock,
        );
        const eidasPartialFailureResponseMock = {
          status: {
            failure: true,
          },
        };
        oidcToEidasServiceMock.mapPartialResponseFailure.mockReturnValueOnce(
          eidasPartialFailureResponseMock,
        );

        // action
        await frIdentityToEuController.redirectToEidasResponseProxy(
          req,
          query,
          sessionServiceEidasMock,
          sessionServiceOidcMock,
        );

        // expect
        expect(sessionServiceEidasMock.set).toHaveBeenCalledTimes(1);
        expect(sessionServiceEidasMock.set).toHaveBeenCalledWith(
          'partialEidasResponse',
          eidasPartialFailureResponseMock,
        );
      });

      it('should failed if identity validation failed', async () => {
        // setup
        const errorMock = new Error('Unknown Error');
        validateIdentityMock.mockReset().mockRejectedValueOnce(errorMock);
        // action

        await frIdentityToEuController.redirectToEidasResponseProxy(
          req,
          query,
          sessionServiceEidasMock,
          sessionServiceOidcMock,
        );
        // expect
        expect(
          oidcToEidasServiceMock.mapPartialResponseFailure,
        ).toHaveBeenCalledTimes(1);
        expect(
          oidcToEidasServiceMock.mapPartialResponseFailure,
        ).toHaveBeenCalledWith(errorMock);
      });
    });
  });

  describe('validateIdentity', () => {
    let validateDtoMock;
    let identityMock;
    beforeEach(() => {
      identityMock = {
        // Oidc naming convention
        // eslint-disable-next-line @typescript-eslint/naming-convention
        given_name: 'given_nameValue',
        // Oidc naming convention
        // eslint-disable-next-line @typescript-eslint/naming-convention
        family_name: 'family_nameValue',
      };
      validateDtoMock = mocked(validateDto);
    });

    it('should succeed to validate identity', async () => {
      // arrange
      validateDtoMock.mockResolvedValueOnce([]);

      // action
      await frIdentityToEuController['validateIdentity'](identityMock);

      // assert
      expect(validateDtoMock).toHaveBeenCalledTimes(1);
      expect(validateDtoMock).toHaveBeenCalledWith(
        identityMock,
        EidasBridgeIdentityDto,
        {
          forbidNonWhitelisted: true,
          forbidUnknownValues: true,
          whitelist: true,
        },
        { excludeExtraneousValues: true },
      );
    });

    it('should failed to validate identity', async () => {
      // arrange
      validateDtoMock.mockResolvedValueOnce(['Unknown Error']);

      await expect(
        // action
        frIdentityToEuController['validateIdentity'](identityMock),
        // assert
      ).rejects.toThrow(EidasBridgeInvalidIdentityException);
    });
  });
});
