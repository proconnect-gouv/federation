import { Test, TestingModule } from '@nestjs/testing';
import { SirenService } from './siren.service';

describe('SirenService', () => {
  let service: SirenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SirenService],
    }).compile();

    service = module.get<SirenService>(SirenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
