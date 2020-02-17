import { Test, TestingModule } from '@nestjs/testing';
import { InseeService } from './insee.service';

describe('InseeService', () => {
  let service: InseeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InseeService],
    }).compile();

    service = module.get<InseeService>(InseeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
