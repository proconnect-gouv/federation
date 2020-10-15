import { Test, TestingModule } from '@nestjs/testing';
import { EidasCommonService } from './eidas-common.service';

describe('EidasCommonService', () => {
  let service: EidasCommonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EidasCommonService],
    }).compile();

    service = module.get<EidasCommonService>(EidasCommonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
