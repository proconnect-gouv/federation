import { Test, TestingModule } from '@nestjs/testing';
import { IdPManagementService } from './idp-management.service';

describe('IdPManagementService', () => {
  let service: IdPManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IdPManagementService],
    }).compile();

    service = module.get<IdPManagementService>(IdPManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
