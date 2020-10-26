import { Test, TestingModule } from '@nestjs/testing';
import { OidcClientService } from '@fc/oidc-client';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';
import { CryptographyService } from '@fc/cryptography';
import { OidcProviderService } from '@fc/oidc-provider';
import { MockIdentityProviderFcaService } from '../services';
import { MockIdentityProviderFcaController } from './mock-identity-provider-fca.controller';

describe('MockIdentityProviderFcaController', () => {
  let controller: MockIdentityProviderFcaController;

  const req = {
    fc: {
      interactionId: 'interactionIdMockValue',
    },
  };
  const res = {
    redirect: jest.fn(),
  };

  const oidcClientServiceMock = {
    getAuthorizeUrl: jest.fn(),
    getTokenSet: jest.fn(),
    getUserInfo: jest.fn(),
    wellKnownKeys: jest.fn(),
    buildAuthorizeParameters: jest.fn(),
    finishInteraction: jest.fn(),
  };

  const loggerServiceMock = ({
    setContext: jest.fn(),
  } as unknown) as LoggerService;

  const sessionMock = {
    patch: jest.fn(),
    get: jest.fn(),
    init: jest.fn(),
    getId: jest.fn(),
  };

  const oidcProviderServiceMock = {
    getInteraction: jest.fn(),
    finishInteraction: jest.fn(),
  };

  const mockIdentityProviderFcaServiceMock = {
    getIdentity: jest.fn(),
  };

  const interactionIdMock = 'interactionIdMockValue';
  const acrMock = 'eidas2';
  const scopeMock = 'scopeMock';
  const providerUidMock = 'providerUidMock';
  const loginMockValue = 'loginMockValue';
  const randomStringMock = 'randomStringMockValue';
  const stateMock = randomStringMock;
  const sessionIdMock = randomStringMock;

  const cryptographyMock = {
    genRandomString: jest.fn(),
  };

  const interactionMock = {
    uid: Symbol('uidMockValue'),
    params: Symbol('paramsMockValue'),
  };

  const sessionMockValue = {
    spName: Symbol('spNameMockValue'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MockIdentityProviderFcaController],
      providers: [
        OidcClientService,
        LoggerService,
        SessionService,
        CryptographyService,
        OidcProviderService,
        MockIdentityProviderFcaService,
      ],
    })
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
      .overrideProvider(MockIdentityProviderFcaService)
      .useValue(mockIdentityProviderFcaServiceMock)
      .compile();

    controller = module.get<MockIdentityProviderFcaController>(
      MockIdentityProviderFcaController,
    );

    jest.resetAllMocks();

    oidcClientServiceMock.buildAuthorizeParameters.mockReturnValue({
      state: stateMock,
      scope: scopeMock,
      providerUid: providerUidMock,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: acrMock,
    });

    oidcProviderServiceMock.getInteraction.mockResolvedValue(interactionMock);
    sessionMock.get.mockResolvedValue(sessionMockValue);

    sessionMock.getId.mockReturnValue(sessionIdMock);

    cryptographyMock.genRandomString.mockReturnValue(randomStringMock);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('index', () => {
    it('Should return some status object', async () => {
      // setup
      sessionMock.init.mockResolvedValueOnce(undefined);
      // action
      const result = await controller.index();
      // assert
      expect(result).toEqual({ status: 'ok' });
    });
  });

  describe('getInteraction', () => {
    it('should call oidcProvider.getInteraction', async () => {
      // When
      await controller.getInteraction(req, res);
      // Then
      expect(oidcProviderServiceMock.getInteraction).toBeCalledTimes(1);
      expect(oidcProviderServiceMock.getInteraction).toBeCalledWith(req, res);
    });

    it('should call session.get with interactionId', async () => {
      // When
      await controller.getInteraction(req, res);
      // Then
      expect(sessionMock.get).toBeCalledTimes(1);
      expect(sessionMock.get).toBeCalledWith(req.fc.interactionId);
    });

    it('should return an object with data from session and oidcProvider interaction', async () => {
      // When
      const result = await controller.getInteraction(req, res);
      // Then
      expect(result).toEqual({
        uid: interactionMock.uid,
        params: interactionMock.params,
        spName: sessionMockValue.spName,
      });
    });
  });

  describe('getLogin', () => {
    const body = {
      login: loginMockValue,
      interactionId: interactionIdMock,
    };

    it('should call service.getAccount()', () => {
      // Given
      const identityMock = {};
      mockIdentityProviderFcaServiceMock.getIdentity.mockResolvedValue(
        identityMock,
      );
      // When
      controller.getLogin(req, res, body);
      // Then

      expect(
        mockIdentityProviderFcaServiceMock.getIdentity,
      ).toHaveBeenCalledTimes(1);
      expect(
        mockIdentityProviderFcaServiceMock.getIdentity,
      ).toHaveBeenCalledWith(body.login);
    });

    it('should call crypto.getRandomString() and pass it to session', async () => {
      // Given
      const randomStringMock = 'randomStringMockValue';
      cryptographyMock.genRandomString.mockReturnValue(randomStringMock);

      const accountMock = {};
      mockIdentityProviderFcaServiceMock.getIdentity.mockResolvedValue(
        accountMock,
      );
      // When
      await controller.getLogin(req, res, body);
      // Then
      expect(cryptographyMock.genRandomString).toHaveBeenCalledTimes(1);
      expect(sessionMock.init).toHaveBeenCalledTimes(1);
      expect(sessionMock.init).toHaveBeenCalledWith(res, body.interactionId, {
        sessionId: randomStringMock,
        spIdentity: accountMock,
      });
    });

    it('should call oidcProvider.finishInteraction', async () => {
      // Given
      const accountMock = {};
      mockIdentityProviderFcaServiceMock.getIdentity.mockResolvedValue(
        accountMock,
      );
      const body = {
        interactionId: interactionIdMock,
        login: loginMockValue,
      };
      // When
      await controller.getLogin(req, res, body);
      // Then
      expect(oidcProviderServiceMock.finishInteraction).toHaveBeenCalledTimes(
        1,
      );
      expect(oidcProviderServiceMock.finishInteraction).toHaveBeenCalledWith(
        req,
        res,
        expect.objectContaining({
          login: {
            account: interactionIdMock,
            acr: acrMock,
            ts: expect.any(Number),
          },
          consent: {
            rejectedScopes: [],
            rejectedClaims: [],
          },
        }),
      );
    });
  });
});
