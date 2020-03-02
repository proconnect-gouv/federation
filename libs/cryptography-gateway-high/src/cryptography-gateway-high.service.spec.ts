import { Test, TestingModule } from '@nestjs/testing';
import { CryptographyGatewayHighService } from './cryptography-gateway-high.service';

describe('CryptographyGatewayHighService', () => {
  let service: CryptographyGatewayHighService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptographyGatewayHighService],
    }).compile();

    service = module.get<CryptographyGatewayHighService>(CryptographyGatewayHighService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
