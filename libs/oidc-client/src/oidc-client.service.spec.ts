import { Test, TestingModule } from '@nestjs/testing';
import { OidcClientService } from './oidc-client.service';

describe('OidcClientService', () => {
  let service: OidcClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OidcClientService],
    }).compile();

    service = module.get<OidcClientService>(OidcClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
