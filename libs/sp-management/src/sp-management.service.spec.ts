import { Test, TestingModule } from '@nestjs/testing';
import { SPManagementService } from './sp-management.service';

describe('SPManagementService', () => {
  let service: SPManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SPManagementService],
    }).compile();

    service = module.get<SPManagementService>(SPManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
