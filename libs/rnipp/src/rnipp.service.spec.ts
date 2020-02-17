import { Test, TestingModule } from '@nestjs/testing';
import { RnippService } from './rnipp.service';

describe('RnippService', () => {
  let service: RnippService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RnippService],
    }).compile();

    service = module.get<RnippService>(RnippService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
