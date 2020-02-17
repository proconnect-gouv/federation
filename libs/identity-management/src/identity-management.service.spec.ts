import { Test, TestingModule } from '@nestjs/testing';
import { IdentityManagementService } from './identity-management.service';

describe('IdentityManagementService', () => {
  let service: IdentityManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IdentityManagementService],
    }).compile();

    service = module.get<IdentityManagementService>(IdentityManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
