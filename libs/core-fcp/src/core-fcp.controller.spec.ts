import { Test, TestingModule } from '@nestjs/testing';
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

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CoreFcpController],
      providers: [OidcProviderService],
    })
      .overrideProvider(OidcProviderService)
      .useValue(oidpcProviderServiceMock)
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
      expect(result).toHaveProperty(
        'uid',
      );
    });
  });
});
