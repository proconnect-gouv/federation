import { ConfigService } from 'nestjs-config';
import { TestingModule, Test } from '@nestjs/testing';
import { InstanceService } from './instance.service';

describe('InstanceService', () => {
  let module: TestingModule;
  let service: InstanceService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    module = await Test.createTestingModule({
      imports: [],
      providers: [InstanceService, ConfigService],
    })
      .overrideProvider(ConfigService)
      .useValue(mockConfigService)
      .compile();

    service = module.get<InstanceService>(InstanceService);
  });

  describe('isFcaLow', () => {
    it('Should return true if we are in an AgentConnect instance', () => {
      // Setup
      mockConfigService.get.mockReturnValue({
        instanceFor: 'FCA-LOW',
      });

      // Action
      const result = service.isFcaLow();

      // Expect
      expect(result).toBe(true);
    });

    it('Should return false if we are not in an AgentConnect instance', () => {
      // Setup
      mockConfigService.get.mockReturnValue({
        instanceFor: 'FCP-HIGH',
      });

      // Action
      const result = service.isFcaLow();

      // Expect
      expect(result).toBe(false);
    });
  });

  describe('isCl', () => {
    it('Should return true if we are in a FranceConnect legacy instance', () => {
      // Setup
      mockConfigService.get.mockReturnValue({
        instanceFor: 'CL',
      });

      // Action
      const result = service.isCl();

      // Expect
      expect(result).toBe(true);
    });

    it('Should return false if we are not in a FranceConnect legacy instance', () => {
      // Setup
      mockConfigService.get.mockReturnValue({
        instanceFor: 'FCA-LOW',
      });

      // Action
      const result = service.isCl();

      // Expect
      expect(result).toBe(false);
    });
  });
});
