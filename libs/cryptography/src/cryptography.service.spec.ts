import { Test, TestingModule } from '@nestjs/testing';
import { CryptographyService } from './cryptography.service';

describe('CryptographyService', () => {
  let service: CryptographyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptographyService],
    }).compile();

    service = module.get<CryptographyService>(CryptographyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
