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

  const oidpcProviderServiceMock = {
    getProvider: () => providerMock,
    wellKnownKeys: jest.fn(),
  };

  const serviceProviderServiceMock = {
    isUsable: jest.fn(),
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
      .useValue(oidpcProviderServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .compile();

    oidcProviderController = await app.get<OidcProviderController>(
      OidcProviderController,
    );

    jest.resetAllMocks();

    serviceProviderServiceMock.isUsable.mockResolvedValue(true);
  });

  describe('getAuthorize', () => {
    it('should check if SP is usable and call next()', async () => {
      // Given
      const query = {
        // param name from OIDC spec
        // eslint-disable-next-line @typescript-eslint/camelcase
        client_id: 'abc123',
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
    it('should call next', async () => {
      // Given
      const next = jest.fn();

      // When
      await oidcProviderController.postToken(next);
      // Then
      expect(next).toBeCalledTimes(1);
    });
  });

  describe('getWellKnownKeys', () => {
    it('should call wellKnownKeys', async () => {
      // Given
      const resolvedValue = Symbol('resolvedValue');
      oidpcProviderServiceMock.wellKnownKeys.mockResolvedValueOnce(
        resolvedValue,
      );
      // When
      const result = await oidcProviderController.getWellKnownKeys();
      // Then
      expect(result).toBe(resolvedValue);
    });
  });

  describe('checkIfSpIsUsable', () => {
    it('should call serviceProvider method', async () => {
      // Given
      const clientIdMock = '42';
      // When
      await oidcProviderController['checkIfSpIsUsable'](clientIdMock);
      // Then
      expect(serviceProviderServiceMock.isUsable).toHaveBeenCalledTimes(1);
      expect(serviceProviderServiceMock.isUsable).toHaveBeenCalledWith(
        clientIdMock,
      );
    });
    it('should throw', async () => {
      // Given
      const clientIdMock = '42';
      serviceProviderServiceMock.isUsable.mockResolvedValueOnce(false);
      // Then
      expect(
        oidcProviderController['checkIfSpIsUsable'](clientIdMock),
      ).rejects.toThrow(Error);
    });
  });
});
