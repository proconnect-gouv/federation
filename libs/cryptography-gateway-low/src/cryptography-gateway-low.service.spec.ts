import { Test, TestingModule } from '@nestjs/testing';
import { CryptographyGatewayLowService } from './cryptography-gateway-low.service';

describe('CryptographyGatewayLowService', () => {
  let service: CryptographyGatewayLowService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptographyGatewayLowService],
    }).compile();

    service = module.get<CryptographyGatewayLowService>(CryptographyGatewayLowService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
