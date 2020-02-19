import { Test, TestingModule } from '@nestjs/testing';
import { CoreFcpController } from './core-fcp.controller';
import { CoreFcpService } from './core-fcp.service';

describe('CoreFcpController', () => {
  let coreFcpController: CoreFcpController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CoreFcpController],
      providers: [CoreFcpService],
    }).compile();

    coreFcpController = app.get<CoreFcpController>(CoreFcpController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(coreFcpController.getRedirectToIdp()).toBe('getRedirectToIdp');
    });
  });
});
