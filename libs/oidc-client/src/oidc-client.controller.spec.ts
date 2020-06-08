import { Test, TestingModule } from '@nestjs/testing';
import { EventBus } from '@nestjs/cqrs';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';
import { IDENTITY_PROVIDER_SERVICE } from './tokens';
import { OidcClientController } from './oidc-client.controller';
import { OidcClientService } from './oidc-client.service';

describe('OidcClient Controller', () => {
  let oidcClientController: OidcClientController;
  let req;
  let res;

  const oidcClientServiceMock = {
    getAuthorizeUrl: jest.fn(),
    getTokenSet: jest.fn(),
    getUserInfo: jest.fn(),
    wellKnownKeys: jest.fn(),
  };

  const loggerServiceMock = ({
    setContext: jest.fn(),
    verbose: jest.fn(),
    debug: jest.fn(),
    businessEvent: jest.fn(),
  } as unknown) as LoggerService;

  const sessionServiceMock = {
    store: jest.fn(),
    set: jest.fn(),
    get: jest.fn(),
  };

  const identityProviderServiceMock = {
    getById: jest.fn(),
  };

  const eventBusMock = {
    publish: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OidcClientController],
      providers: [
        OidcClientService,
        LoggerService,
        SessionService,
        EventBus,
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
      .overrideProvider(EventBus)
      .useValue(eventBusMock)
      .compile();

    oidcClientController = module.get<OidcClientController>(
      OidcClientController,
    );

    res = {
      redirect: jest.fn(),
    };

    req = {
      session: {
        destroy: jest.fn(),
        idToken: 'idToken',
      },
    };

    jest.resetAllMocks();

    identityProviderServiceMock.getById.mockReturnValue({ name: 'foo' });
  });

  it('should be defined', () => {
    expect(oidcClientController).toBeDefined();
  });

  describe('redirectToIdp', () => {
    it('Should call oidc-client-service for retrieve authorize url', async () => {
      // setup
      const body = {
        uid: '123',
        scope: 'openid',
        providerUid: 'abcdefghijklmnopqrstuvwxyz',
        // oidc param
        // eslint-disable-next-line @typescript-eslint/camelcase
        acr_values: 'eidas3',
      };

      const mockedoidcClientService =
        'https://my-authentication-openid-url.com';

      oidcClientServiceMock.getAuthorizeUrl.mockReturnValueOnce(
        mockedoidcClientService,
      );

      // action
      await oidcClientController.redirectToIdp(res, body);

      // assert
      expect(oidcClientServiceMock.getAuthorizeUrl).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith(mockedoidcClientService);
    });
  });

  describe('getOidcCallback', () => {
    it('Should call oidc-client-service for retrieve authorize url', async () => {
      // setup
      const accessToken = 'accest_token';
      const providerUid = 'foo';
      oidcClientServiceMock.getTokenSet.mockReturnValueOnce({
        // oidc spec defined property
        // eslint-disable-next-line @typescript-eslint/camelcase
        access_token: 'accest_token',
        // oidc spec defined property
        // eslint-disable-next-line @typescript-eslint/camelcase
        id_token: 'id_token',
        claims: jest.fn().mockReturnValueOnce({ acr: 'foo' }),
      });
      oidcClientServiceMock.getUserInfo.mockReturnValueOnce({
        sub: '1',
        // oidc spec defined property
        // eslint-disable-next-line @typescript-eslint/camelcase
        given_name: 'given_name',
      });

      // action
      await oidcClientController.getOidcCallback(req, res, { providerUid });

      // assert
      expect(oidcClientServiceMock.getTokenSet).toHaveBeenCalledTimes(1);
      expect(oidcClientServiceMock.getTokenSet).toHaveBeenCalledWith(
        req,
        providerUid,
      );
      expect(oidcClientServiceMock.getUserInfo).toHaveBeenCalledTimes(1);
      expect(oidcClientServiceMock.getUserInfo).toHaveBeenCalledWith(
        accessToken,
        providerUid,
      );

      expect(res.redirect).toHaveBeenCalledTimes(1);
    });
  });

  describe('getWellKnownKeys', () => {
    it('Should call oidc-client-service for wellKnownKeys', async () => {
      // When
      await oidcClientController.getWellKnownKeys();
      // Then
      expect(oidcClientServiceMock.wellKnownKeys).toHaveBeenCalledTimes(1);
    });
  });
});
