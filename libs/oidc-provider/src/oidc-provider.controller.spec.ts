import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { OidcProviderService } from '@fc/oidc-provider';
import { OidcProviderController } from './oidc-provider.controller';
import { IDENTITY_MANAGEMENT_SERVICE, SP_MANAGEMENT_SERVICE } from './tokens';

describe('OidcProviderController', () => {
  let oidcProviderController: OidcProviderController;

  const providerMock = {
    interactionDetails: jest.fn(),
  };

  const oidpcProviderServiceMock = {
    getProvider: () => providerMock,
  };

  const identityManagementServiceMock = {
    getIdentity: jest.fn(),
  };

  const spManagementServiceMock = {
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
          provide: IDENTITY_MANAGEMENT_SERVICE,
          useValue: identityManagementServiceMock,
        },
        {
          provide: SP_MANAGEMENT_SERVICE,
          useValue: spManagementServiceMock,
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

      spManagementServiceMock.isUsable.mockResolvedValue(true);
      // When
      await oidcProviderController.getAuthorize(next, query);
      // Then
      expect(spManagementServiceMock.isUsable).toBeCalledTimes(1);
      expect(spManagementServiceMock.isUsable).toBeCalledWith('abc123');
      expect(next).toBeCalledTimes(1);
    });
  });

  describe('postToken', () => {
    it('should check if SP is usable and call next()', async () => {
      // Given
      const req = {
        body: {
          // param name from OIDC spec
          // eslint-disable-next-line @typescript-eslint/camelcase
          client_id: 'abc123',
        },
      };

      const next = jest.fn();

      spManagementServiceMock.isUsable.mockResolvedValue(true);
      // When
      await oidcProviderController.postToken(next, req);
      // Then
      expect(spManagementServiceMock.isUsable).toBeCalledTimes(1);
      expect(spManagementServiceMock.isUsable).toBeCalledWith('abc123');
      expect(next).toBeCalledTimes(1);
    });
  });

  describe('getUserInfo', () => {
    it('should call identity service', async () => {
      // Given
      const req = {};

      // When
      await oidcProviderController.getUserInfo(req);
      // Then
      expect(identityManagementServiceMock.getIdentity).toBeCalledTimes(1);
    });
  });
});
