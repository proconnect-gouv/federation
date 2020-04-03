import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { CryptographyGatewayHighService } from './cryptography-gateway-high.service';

describe('CryptographyGatewayHighService', () => {
  let service: CryptographyGatewayHighService;

  const loggerServiceMock = {
    setContext: jest.fn(),
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptographyGatewayHighService, LoggerService],
    })
    .overrideProvider(LoggerService)
    .useValue(loggerServiceMock)
    .compile();

    service = module.get<CryptographyGatewayHighService>(
      CryptographyGatewayHighService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
