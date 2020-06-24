import { Test, TestingModule } from '@nestjs/testing';
import { MockServiceProviderService } from './mock-service-provider.service';

describe('MockServiceProviderService', () => {
  let service: MockServiceProviderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MockServiceProviderService],
    }).compile();

    service = module.get<MockServiceProviderService>(MockServiceProviderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
