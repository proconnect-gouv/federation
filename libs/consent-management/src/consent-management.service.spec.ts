import { Test, TestingModule } from '@nestjs/testing';
import { ConsentManagementService } from './consent-management.service';

describe('ConsentManagementService', () => {
  let service: ConsentManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConsentManagementService],
    }).compile();

    service = module.get<ConsentManagementService>(ConsentManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
