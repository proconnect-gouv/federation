import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@fc/config';
import { EidasBridgeController } from './eidas-bridge.controller';

describe('CoreFcpController', () => {
  let eidasBridgeController: EidasBridgeController;

  const configServiceMock = {
    get: jest.fn(),
  };

  const appConfigMock = {
    urlPrefix: '/api/v2',
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [EidasBridgeController],
      providers: [ConfigService],
    })
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .compile();

      eidasBridgeController = await app.get<EidasBridgeController>(EidasBridgeController);

    jest.resetAllMocks();
    configServiceMock.get.mockReturnValue(appConfigMock);
  });

  describe('getDefault', () => {
    it('should return Hello Eidas', () => {
      // When
      const result = eidasBridgeController.getDefault();
      // Then
      expect(result).toEqual({message: "Hello Eidas"});
    });
  });
});
