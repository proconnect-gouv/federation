import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { IdentityManagementService } from './identity-management.service';

describe('IdentityManagementService', () => {
  let service: IdentityManagementService;

  const loggerServiceMock = ({
    setContext: jest.fn(),
    trace: jest.fn(),
    debug: jest.fn(),
  } as unknown) as LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IdentityManagementService, LoggerService],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .compile();

    service = module.get<IdentityManagementService>(IdentityManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getIdentity & storeIdentity', () => {
    it('should store and retrieve an identity', async () => {
      // Given
      const key = 'bar';
      const identityMock = { foo: 'foo' };
      // When
      await service.storeIdentity(key, identityMock);
      const result = await service.getIdentity(key);
      // Then
      expect(result).toBe(identityMock);
    });

    it('should return false if identity does not exists', async () => {
      // Given
      const key = 'foo';
      // When
      const result = await service.getIdentity(key);
      // Then
      expect(result).toBeFalsy();
    });
  });
});
