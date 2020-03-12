import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { OidcClientController } from './oidc-client.controller';
import { OidcClientService } from './oidc-client.service';
import { IDENTITY_MANAGEMENT_SERVICE } from './tokens';

describe('OidcClient Controller', () => {
  let oidcClientController: OidcClientController;
  let req;
  let res;
  const oidcClientServiceMock = {
    getAuthorizeUrl: jest.fn(),
    getTokenSet: jest.fn(),
    getUserInfo: jest.fn(),
  };

  const loggerServiceMock = ({
    setContext: jest.fn(),
    verbose: jest.fn(),
    debug: jest.fn(),
    businessEvent: jest.fn(),
  } as unknown) as LoggerService;

  const identityManagementServiceMock = {
    storeIdentity: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OidcClientController],
      providers: [
        OidcClientService,
        LoggerService,
        {
          provide: IDENTITY_MANAGEMENT_SERVICE,
          useValue: identityManagementServiceMock,
        },
      ],
    })
      .overrideProvider(OidcClientService)
      .useValue(oidcClientServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
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
  });

  it('should be defined', () => {
    expect(oidcClientController).toBeDefined();
  });

  describe('redirectToIdp', () => {
    it('Should call oidc-client-service for retrieve authorize url', async () => {
      // setup
      const body = {
        uid: '123',
      };
      const mockedoidcClientService =
        'https://my-authentication-openid-url.com';

      oidcClientServiceMock.getAuthorizeUrl.mockReturnValueOnce(
        mockedoidcClientService,
      );

      // action
      await oidcClientController.redirectToIdp(req, res, body);

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
      const idToken = 'id_token';
      const userinfo = {
        sub: '1',
        // oidc spec defined property
        // eslint-disable-next-line @typescript-eslint/camelcase
        given_name: 'given_name',
      };

      oidcClientServiceMock.getTokenSet.mockReturnValueOnce({
        // oidc spec defined property
        // eslint-disable-next-line @typescript-eslint/camelcase
        access_token: 'accest_token',
        // oidc spec defined property
        // eslint-disable-next-line @typescript-eslint/camelcase
        id_token: 'id_token',
      });

      oidcClientServiceMock.getUserInfo.mockReturnValueOnce({
        sub: '1',
        // oidc spec defined property
        // eslint-disable-next-line @typescript-eslint/camelcase
        given_name: 'given_name',
      });

      // action
      await oidcClientController.getOidcCallback(req, res);

      // assert
      expect(oidcClientServiceMock.getTokenSet).toHaveBeenCalledTimes(1);
      expect(oidcClientServiceMock.getTokenSet).toHaveBeenCalledWith(req);
      expect(oidcClientServiceMock.getUserInfo).toHaveBeenCalledTimes(1);
      expect(oidcClientServiceMock.getUserInfo).toHaveBeenCalledWith(
        accessToken,
      );

      expect(res.redirect).toHaveBeenCalledTimes(1);
    });
  });
});
