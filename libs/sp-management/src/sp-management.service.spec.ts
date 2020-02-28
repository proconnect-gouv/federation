import { Test, TestingModule } from '@nestjs/testing';
import { SpManagementService } from './sp-management.service';

describe('SpManagementService', () => {
  let service: SpManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SpManagementService],
    }).compile();

    service = module.get<SpManagementService>(SpManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
