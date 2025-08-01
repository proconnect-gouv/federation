import { TestingModule, Test } from '@nestjs/testing';
import { ConfigService } from 'nestjs-config';
import { SecretAdapter } from './secret.adapter';
import { SecretManagerService } from './secret-manager.service';
jest.mock('uuid'); // allow to mock all module
import { v4 as uuidv4 } from 'uuid';

describe('SecretAdapter', () => {
  let module: TestingModule;
  let service: SecretAdapter;

  const secretManagerMocked = {
    encrypt: jest.fn(),
    decrypt: jest.fn(),
    generateSHA256: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [SecretAdapter, SecretManagerService],
    })
      .overrideProvider(SecretManagerService)
      .useValue(secretManagerMocked)
      .compile();

    service = await module.get<SecretAdapter>(SecretAdapter);

    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateSecret', () => {
    it('Should return a new secret', async () => {
      secretManagerMocked.generateSHA256.mockReturnValue('randomMockValue');
      const expected = 'randomMockValue';
      const result = service.generateSecret();

      expect(result).toEqual(expected);
    });
  });

  describe('generateKey', () => {
    it('Should use the secret manager', async () => {
      const expected = '76eded44d32b40c0cb1006065';
      // uuidv4 is fully mocked by the jest.mock("uuid") on top
      (uuidv4 as jest.Mock).mockReturnValue('76eded44d32b40c0cb1006065');

      // tslint:disable-next-line:no-string-literal
      const result = await service.generateKey();

      expect(uuidv4).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expected);
    });
  });
});
