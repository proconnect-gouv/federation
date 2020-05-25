import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { OidcProviderService } from '@fc/oidc-provider';
import { OidcProviderController } from './oidc-provider.controller';
import { SERVICE_PROVIDER_SERVICE } from './tokens';

describe('OidcProviderController', () => {
  let oidcProviderController: OidcProviderController;

  const providerMock = {
    interactionDetails: jest.fn(),
  };

  const oidcProviderServiceMock = {
    getProvider: () => providerMock,
    wellKnownKeys: jest.fn(),
    decodeAuthorizationHeader: jest.fn(),
  };

  const serviceProviderServiceMock = {
    isActive: jest.fn(),
  };

  const loggerServiceMock = ({
    setContext: jest.fn(),
    verbose: jest.fn(),
    businessEvent: jest.fn(),
    debug: jest.fn(),
  } as unknown) as LoggerService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [OidcProviderController],
      providers: [
        OidcProviderService,
        LoggerService,
        {
          provide: SERVICE_PROVIDER_SERVICE,
          useValue: serviceProviderServiceMock,
        },
      ],
    })
      .overrideProvider(OidcProviderService)
      .useValue(oidcProviderServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .compile();

    oidcProviderController = await app.get<OidcProviderController>(
      OidcProviderController,
    );

    jest.resetAllMocks();

    serviceProviderServiceMock.isActive.mockResolvedValue(true);
  });

  describe('getAuthorize', () => {
    it('should check if SP is usable and call next()', async () => {
      // Given
      const query = {
        // param name from OIDC spec
        // eslint-disable-next-line @typescript-eslint/camelcase
        client_id: 'abc123',
        // param name from OIDC spec
        // eslint-disable-next-line @typescript-eslint/camelcase
        response_type: 'code',
        // param name from OIDC spec
        // eslint-disable-next-line @typescript-eslint/camelcase
        acr_values: 'eidas3',
        // param name from OIDC spec
        // eslint-disable-next-line @typescript-eslint/camelcase
        state: 'state',
        nonce: 'nonce',
        scope: 'openid',
        // param name from OIDC spec
        // eslint-disable-next-line @typescript-eslint/camelcase
        redirect_uri: 'http://some.where',
      };

      const next = jest.fn();

      oidcProviderController['checkIfSpIsUsable'] = jest
        .fn()
        .mockResolvedValue(true);
      // When
      await oidcProviderController.getAuthorize(next, query);
      // Then
      expect(oidcProviderController['checkIfSpIsUsable']).toBeCalledTimes(1);
      expect(oidcProviderController['checkIfSpIsUsable']).toBeCalledWith(
        'abc123',
      );
      expect(next).toBeCalledTimes(1);
    });
  });

  describe('getUserInfo', () => {
    it('should call identity service', async () => {
      // Given
      const next = jest.fn();

      // When
      await oidcProviderController.getUserInfo(next);
      // Then
      expect(next).toBeCalledTimes(1);
    });
  });

  describe('postToken', () => {
    it('should check if SP is usable and call next()', async () => {
      // Given
      const req = {
        headers: {
          authorization: 'Basic YWJjMTIz',
        },
      };
      oidcProviderServiceMock.decodeAuthorizationHeader.mockReturnValueOnce(
        'abc123',
      );
      serviceProviderServiceMock.isActive.mockResolvedValueOnce(true);
      const next = jest.fn();

      // When
      await oidcProviderController.postToken(next, req);
      // Then
      expect(serviceProviderServiceMock.isActive).toBeCalledTimes(1);
      expect(serviceProviderServiceMock.isActive).toBeCalledWith('abc123');
      expect(next).toBeCalledTimes(1);
    });
  });

  describe('getLogout', () => {
    it('should call logout service', async () => {
      // Given
      const next = jest.fn();

      // When
      await oidcProviderController.getLogout(next);
      // Then
      expect(next).toBeCalledTimes(1);
    });
  });

  describe('getLogoutConfirm', () => {
    it('should call logout confirm service', async () => {
      // Given
      const next = jest.fn();

      // When
      await oidcProviderController.getLogoutConfirm(next);
      // Then
      expect(next).toBeCalledTimes(1);
    });
  });

  describe('checkIfSpIsUsable', () => {
    it('should call serviceProvider method', async () => {
      // Given
      const clientIdMock = '42';
      // When
      await oidcProviderController['checkIfSpIsUsable'](clientIdMock);
      // Then
      expect(serviceProviderServiceMock.isActive).toHaveBeenCalledTimes(1);
      expect(serviceProviderServiceMock.isActive).toHaveBeenCalledWith(
        clientIdMock,
      );
    });
    it('should throw', async () => {
      // Given
      const clientIdMock = '42';
      serviceProviderServiceMock.isActive.mockResolvedValueOnce(false);
      // Then
      expect(
        oidcProviderController['checkIfSpIsUsable'](clientIdMock),
      ).rejects.toThrow(Error);
    });
  });
});
