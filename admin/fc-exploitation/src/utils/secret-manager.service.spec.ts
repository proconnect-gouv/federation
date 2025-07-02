import * as crypto from 'crypto';
import { TestingModule, Test } from '@nestjs/testing';
import { ConfigService } from 'nestjs-config';
import { SecretManagerService } from '../utils/secret-manager.service';

describe('SecretManagerService', () => {
  let module: TestingModule;
  let service: SecretManagerService;

  const mockEncryptKey = 'p@ss p@rt0ut';
  const mockData = {
    // openid connect claim is not camelcase
    // eslint-disable-next-line @typescript-eslint/camelcase
    given_name: 'Chuck',
    // openid connect claim is not camelcase
    // eslint-disable-next-line @typescript-eslint/camelcase
    family_name: 'NORRIS',
  };
  const mockDataToEncrypt = JSON.stringify(mockData);
  const mockDecryptedData = mockDataToEncrypt;

  const mockRandomBytes12 = Buffer.from('424242424242', 'utf8');
  const mockAuthTag16 = Buffer.from('2121212121212121', 'utf8');
  const mockCiphertext = Buffer.from(
    "Chuck Norris cannot be ciphered, it's the cipher who is chuck-norissed",
    'utf8',
  );
  const mockCipher = Buffer.concat([
    mockRandomBytes12,
    mockAuthTag16,
    mockCiphertext,
  ]).toString('base64');

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockCrypto = {
    randomBytes: jest.fn(),
    createHash: jest.fn(),
    createHmac: jest.fn(),
    createCipheriv: jest.fn(),
    createDecipheriv: jest.fn(),
  };

  const mockCipherGcm = {
    update: jest.fn(),
    final: jest.fn(),
    getAuthTag: jest.fn(),
  };

  const mockDecipherGcm = {
    update: jest.fn(),
    setAuthTag: jest.fn(),
    final: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    module = await Test.createTestingModule({
      imports: [],
      providers: [SecretManagerService, ConfigService],
    })
      .overrideProvider(ConfigService)
      .useValue(mockConfigService)
      .compile();

    service = await module.get<SecretManagerService>(SecretManagerService);

    mockConfigService.get.mockReturnValue({
      cipherPass: mockEncryptKey,
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('encrypt', () => {
    beforeEach(() => {
      jest
        .spyOn(crypto, 'randomBytes')
        .mockImplementationOnce(mockCrypto.randomBytes);
      mockCrypto.randomBytes.mockReturnValueOnce(mockRandomBytes12);

      jest
        .spyOn(crypto, 'createCipheriv')
        .mockImplementationOnce(mockCrypto.createCipheriv);
      mockCrypto.createCipheriv.mockReturnValueOnce(mockCipherGcm);
      mockCipherGcm.update.mockReturnValueOnce(mockCiphertext);
      mockCipherGcm.getAuthTag.mockReturnValueOnce(mockAuthTag16);
    });

    it('should generate a 12 bytes nonce by calling crypto.randomBytes', () => {
      // setup
      const randomBytesSize = 12;

      // action
      service.encrypt(mockDataToEncrypt);

      // expect
      expect(mockCrypto.randomBytes).toHaveBeenCalledTimes(1);
      expect(mockCrypto.randomBytes).toHaveBeenCalledWith(randomBytesSize);
    });

    it('should create a cipher instance with aes-256-gcm and 16 bytes authTag', () => {
      // action
      service.encrypt(mockDataToEncrypt);

      // expect
      expect(mockCrypto.createCipheriv).toHaveBeenCalledTimes(1);
      expect(mockCrypto.createCipheriv).toHaveBeenCalledWith(
        'aes-256-gcm',
        mockEncryptKey,
        mockRandomBytes12,
        {
          authTagLength: 16,
        },
      );
    });

    it('should encrypt the given data using the cipher instance', () => {
      // action
      service.encrypt(mockDataToEncrypt);

      // expect
      expect(mockCipherGcm.update).toHaveBeenCalledTimes(1);
      expect(mockCipherGcm.update).toHaveBeenCalledWith(
        mockDataToEncrypt,
        'utf8',
      );
      expect(mockCipherGcm.final).toHaveBeenCalledTimes(1);
    });

    it('should get the authTag from the cipher instance', () => {
      // action
      service.encrypt(mockDataToEncrypt);

      // expect
      expect(mockCipherGcm.getAuthTag).toHaveBeenCalledTimes(1);
    });

    it('should return a buffer containing "nonce", "authTag" and "ciphertext" in this order', () => {
      // action
      const result = service.encrypt(mockDataToEncrypt);

      // expect
      expect(result).toStrictEqual(mockCipher);
    });
  });

  describe('decrypt', () => {
    beforeEach(() => {
      jest
        .spyOn(crypto, 'createDecipheriv')
        .mockImplementationOnce(mockCrypto.createDecipheriv);
      mockCrypto.createDecipheriv.mockReturnValueOnce(mockDecipherGcm);
      mockDecipherGcm.update.mockReturnValueOnce(mockDecryptedData);
    });

    it('should throw an error when given cipher length is lower than cipher head length', () => {
      // etup
      const WRONG_CIPHER = Buffer.from(
        '------28_BYTES_STRING-------',
        'utf8',
      ).toString('base64');

      // action
      try {
        service.decrypt(WRONG_CIPHER);
      } catch (e) {
        // expect
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe('Authentication failed !');
      }

      // expect
      expect.hasAssertions();
    });

    it('should throw an error when given cipher length is equal to cipher head length', () => {
      // setup
      const WRONG_CIPHER = Buffer.from(
        '------28_BYTES_STRING-------',
        'utf8',
      ).toString('base64');

      // action
      try {
        service.decrypt(WRONG_CIPHER);
      } catch (e) {
        // expect
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe('Authentication failed !');
      }

      // expect
      expect.hasAssertions();
    });

    it('should create a decipher instance with aes-256-gcm and 16 bytes authTag', () => {
      // action
      service.decrypt(mockCipher);

      // expect
      expect(mockCrypto.createDecipheriv).toHaveBeenCalledTimes(1);
      expect(mockCrypto.createDecipheriv).toHaveBeenCalledWith(
        'aes-256-gcm',
        mockEncryptKey,
        mockRandomBytes12,
        {
          authTagLength: 16,
        },
      );
    });

    it('should set authenthication tag retrieved from the cipher', () => {
      // action
      service.decrypt(mockCipher);

      // expect
      expect(mockDecipherGcm.setAuthTag).toHaveBeenCalledTimes(1);
      expect(mockDecipherGcm.setAuthTag).toHaveBeenCalledWith(mockAuthTag16);
    });

    it('should decrypt the given ciphertext using the cipher instance', () => {
      // action
      const result = service.decrypt(mockCipher);

      // expect
      expect(mockDecipherGcm.update).toHaveBeenCalledTimes(1);
      expect(mockDecipherGcm.update).toHaveBeenCalledWith(
        mockCiphertext,
        null,
        'utf8',
      );
      expect(mockDecipherGcm.final).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual(mockDataToEncrypt);
    });

    it('should throw authentication error when cipher final fail', () => {
      // setup
      mockDecipherGcm.final.mockImplementationOnce(() => {
        throw new Error('Christmas is cancelled !');
      });

      // action
      try {
        service.decrypt(mockCipher);
      } catch (e) {
        // expect
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe('Authentication failed !');
      }

      // expect
      expect.hasAssertions();
    });
  });
});
