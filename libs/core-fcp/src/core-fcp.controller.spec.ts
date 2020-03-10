import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { OidcProviderService } from '@fc/oidc-provider';
import { CoreFcpController } from './core-fcp.controller';

describe('CoreFcpController', () => {
  let coreFcpController: CoreFcpController;

  const providerMock = {
    interactionDetails: jest.fn(),
  };

  const oidpcProviderServiceMock = {
    getProvider: () => providerMock,
  };

  const loggerServiceMock = ({
    setContext: jest.fn(),
    verbose: jest.fn(),
    businessEvent: jest.fn(),
  } as unknown) as LoggerService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CoreFcpController],
      providers: [LoggerService, OidcProviderService],
    })
      .overrideProvider(OidcProviderService)
      .useValue(oidpcProviderServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .compile();

    coreFcpController = await app.get<CoreFcpController>(CoreFcpController);

    jest.resetAllMocks();
  });

  describe('getInteraction', () => {
    it('should return uid', async () => {
      // Given
      const req = {};
      const res = {};
      providerMock.interactionDetails.mockResolvedValue({
        uid: 'uid',
        prompt: 'prompt',
        params: 'params',
      });
      // When
      const result = await coreFcpController.getInteraction(req, res);
      // Then
      expect(result).toHaveProperty('uid');
    });
  });
});
