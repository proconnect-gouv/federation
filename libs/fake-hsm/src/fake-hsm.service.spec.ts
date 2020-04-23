import * as crypto from 'crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { FakeHsmService } from './fake-hsm.service';
import { ConfigService } from '@fc/config';

describe('FakeHsmService', () => {
  let service: FakeHsmService;

  const JWKSkeysMock = [
    {
      crv: 'P-256',
      x: 'uRxO96Oqn0BEJZYua3rkM9ntzLbt_nDbq4hwSgOUomQ',
      y: 'o9BoK63TMCGmXjOcCZbtOTmw5HdGiy5ZzY4Qo5KG638',
      d: 'sMJDu7_nEjB0SwTKuKR8XiZPHvoUkem3rdgxP39kkfQ',
      kty: 'EC',
      kid: 'pkcs11_cka_label:my-test-key',
      use: 'sig',
    },
  ];
  const configServiceMock = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FakeHsmService, ConfigService],
    })
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .compile();

    service = module.get<FakeHsmService>(FakeHsmService);

    jest.resetAllMocks();
    configServiceMock.get.mockReturnValue({ keys: JWKSkeysMock });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sign', () => {
    it('should call crypto sign', async () => {
      // Given
      const dataMock = Buffer.from('data');
      const digest = 'sha256';
      const sign = jest.spyOn(crypto, 'sign');
      // When
      await service.sign(dataMock, digest);
      // Then
      expect(sign).toHaveBeenCalledTimes(1);
      expect(sign).toHaveBeenCalledWith(digest, dataMock, expect.any(Object));
    });
    it('should reject if an error occured', async () => {
      // Given
      const dataMock = Buffer.from('data');
      const exceptionMock = new Error('exceptionMock');
      jest.spyOn(crypto, 'sign').mockImplementation(() => {
        throw exceptionMock;
      });
      // Then
      await expect(service.sign(dataMock)).rejects.toThrow(exceptionMock);
    });
  });
});
