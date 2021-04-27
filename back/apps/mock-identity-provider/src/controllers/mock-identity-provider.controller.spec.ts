import { Test, TestingModule } from '@nestjs/testing';
import { OidcClientService } from '@fc/oidc-client';
import { LoggerService } from '@fc/logger';
import { SessionGenericService } from '@fc/session-generic';
import { OidcProviderService } from '@fc/oidc-provider';
import { MockIdentityProviderService } from '../services';
import { MockIdentityProviderController } from './mock-identity-provider.controller';

describe('MockIdentityProviderFcaController', () => {
  let controller: MockIdentityProviderController;

  const req = {
    fc: {
      interactionId: 'interactionIdMockValue',
    },
  };
  const res = {
    redirect: jest.fn(),
  };

  const next = jest.fn();

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

  const sessionServiceMock = {
    set: jest.fn(),
    get: jest.fn(),
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

  const interactionMock = {
    uid: 'uidMockValue',
    params: 'paramsMockValue',
  };

  const sessionMockValue = {
    spName: Symbol('spNameMockValue'),
    spAcr: acrMock,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MockIdentityProviderController],
      providers: [
        OidcClientService,
        LoggerService,
        SessionGenericService,
        OidcProviderService,
        MockIdentityProviderService,
      ],
    })
      .overrideProvider(OidcClientService)
      .useValue(oidcClientServiceMock)

      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)

      .overrideProvider(SessionGenericService)
      .useValue(sessionServiceMock)

      .overrideProvider(OidcProviderService)
      .useValue(oidcProviderServiceMock)

      .overrideProvider(MockIdentityProviderService)
      .useValue(mockIdentityProviderFcaServiceMock)

      .compile();

    controller = module.get<MockIdentityProviderController>(
      MockIdentityProviderController,
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
    sessionServiceMock.get.mockResolvedValue(sessionMockValue);

    sessionServiceMock.getId.mockReturnValue(sessionIdMock);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('index', () => {
    it('Should return some status object', async () => {
      // setup
      sessionServiceMock.set.mockResolvedValueOnce(undefined);
      // action
      const result = await controller.index();
      // assert
      expect(result).toEqual({ status: 'ok' });
    });
  });

  describe('getInteraction', () => {
    it('should call oidcProvider.getInteraction', async () => {
      // When
      await controller.getInteraction(req, res, sessionServiceMock);
      // Then
      expect(oidcProviderServiceMock.getInteraction).toBeCalledTimes(1);
      expect(oidcProviderServiceMock.getInteraction).toBeCalledWith(req, res);
    });

    it('should call session.get with interactionId', async () => {
      // When
      await controller.getInteraction(req, res, sessionServiceMock);
      // Then
      expect(sessionServiceMock.get).toBeCalledTimes(1);
      expect(sessionServiceMock.get).toBeCalledWith();
    });

    it('should return an object with data from session and oidcProvider interaction', async () => {
      // When
      const result = await controller.getInteraction(
        req,
        res,
        sessionServiceMock,
      );
      // Then
      expect(result).toEqual({
        uid: interactionMock.uid,
        params: interactionMock.params,
        spName: sessionMockValue.spName,
      });
    });
  });

  describe('getLogin', () => {
    const interactionId: string = interactionIdMock;
    const body = {
      login: loginMockValue,
      interactionId,
    };

    it('should call service.getIdentity()', async () => {
      // Given
      const identityMock = {};
      mockIdentityProviderFcaServiceMock.getIdentity.mockResolvedValue(
        identityMock,
      );
      // When
      await controller.getLogin(next, body, sessionServiceMock);
      // Then

      expect(
        mockIdentityProviderFcaServiceMock.getIdentity,
      ).toHaveBeenCalledTimes(1);
      expect(
        mockIdentityProviderFcaServiceMock.getIdentity,
      ).toHaveBeenCalledWith(body.login);
    });

    it('should call next if the identity is found', async () => {
      // Given
      const accountMock = {};
      mockIdentityProviderFcaServiceMock.getIdentity.mockResolvedValue(
        accountMock,
      );
      const interactionId: string = interactionIdMock;
      const body = {
        interactionId,
        login: loginMockValue,
      };
      // When
      await controller.getLogin(next, body, sessionServiceMock);
      // Then
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  it('should throw an error and not call "next" if the identity is not found', async () => {
    // Given
    mockIdentityProviderFcaServiceMock.getIdentity.mockResolvedValue(undefined);
    const interactionId: string = interactionIdMock;
    const body = {
      interactionId,
      login: loginMockValue,
    };
    const expectedError = new Error('Identity not found in database');

    // When / Then
    await expect(() =>
      controller.getLogin(next, body, sessionServiceMock),
    ).rejects.toThrow(expectedError);
    expect(next).toHaveBeenCalledTimes(0);
  });
});
