import { Test, TestingModule } from '@nestjs/testing';
import * as crypto from 'crypto';
import { CryptographyGatewayLowService } from './cryptography-gateway-low.service';

describe('CryptographyGatewayLowService', () => {
  let service: CryptographyGatewayLowService;

  const mockSigner = ({
    write: jest.fn(),
    end: jest.fn(),
    sign: jest.fn(),
  } as unknown) as crypto.Signer;

  const dataMock = Buffer.from('data', 'utf8');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptographyGatewayLowService],
    }).compile();

    service = module.get<CryptographyGatewayLowService>(CryptographyGatewayLowService);

    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sign', () => {
    beforeEach(() => {
      jest.spyOn(crypto, 'createSign').mockReturnValueOnce(mockSigner);
      jest.spyOn(mockSigner, 'sign').mockReturnValueOnce('signature');
    });

    it('should calls crypto library with sha256 digest and return the signature', async () => {
      // setup
      const privateKey = 'private-key';
      const data = Buffer.from('data', 'utf8');

      // action
      const signature = await service.sign(privateKey, data);

      // expect
      expect(crypto.createSign).toBeCalledTimes(1);
      expect(crypto.createSign).toBeCalledWith('sha256');
      expect(mockSigner.write).toBeCalledTimes(1);
      expect(mockSigner.write).toBeCalledWith(data);
      expect(mockSigner.end).toBeCalledTimes(1);
      expect(mockSigner.end).toBeCalledWith();
      expect(mockSigner.sign).toBeCalledTimes(1);
      expect(mockSigner.sign).toBeCalledWith(privateKey);

      expect(signature).toBe('signature');
    });

    it('should call crypto library with sha512 digest and return the signature', async () => {
      // setup
      const privateKey = 'private-key';
      const data = Buffer.from('data', 'utf8');
      const digest = 'sha512';

      // action
      const signature = await service.sign(privateKey, data, digest);

      // expect
      expect(crypto.createSign).toBeCalledTimes(1);
      expect(crypto.createSign).toBeCalledWith(digest);
      expect(mockSigner.write).toBeCalledTimes(1);
      expect(mockSigner.write).toBeCalledWith(data);
      expect(mockSigner.end).toBeCalledTimes(1);
      expect(mockSigner.end).toBeCalledWith();
      expect(mockSigner.sign).toBeCalledTimes(1);
      expect(mockSigner.sign).toBeCalledWith(privateKey);

      expect(signature).toBe('signature');
    });
  });

  describe('privateDecrypt', () => {
    beforeEach(() => {
      jest.spyOn(crypto, 'privateDecrypt').mockReturnValueOnce(dataMock);
    });

    it('should call crypto library and return the decrypted data', async () => {
      // setup
      const privateKey = 'private-key';
      const cipher = Buffer.from('cipher', 'utf8');

      // action
      const data = await service.privateDecrypt(privateKey, cipher);

      // expect
      expect(crypto.privateDecrypt).toBeCalledTimes(1);
      expect(crypto.privateDecrypt).toBeCalledWith(privateKey, cipher);

      expect(data).toMatchObject(dataMock);
    });
  });
});
