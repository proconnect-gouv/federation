import * as crypto from 'crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { ConfigService } from '@fc/config';
import * as ecdsaSignaturesService from 'jose/lib/help/ecdsa_signatures';
import { CryptographyService } from './cryptography.service';
import { IPivotIdentity } from '../interfaces';
import { OverrideCode } from '@fc/common';
import {
  CryptographyGatewayException,
  CryptographyComputeIdentityHashException,
} from '../exceptions';

describe('CryptographyService', () => {
  let service: CryptographyService;

  const loggerServiceMock = {
    setContext: jest.fn(),
    debug: jest.fn(),
  };

  const messageMock = {
    subscribe: jest.fn(),
  };

  const brokerMock = {
    send: jest.fn(),
    connect: jest.fn(),
  };

  const configMock = {
    get: jest.fn(),
  };

  const brokerResponseMock = 'brokerResponseMock';

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
  ]);

  const pivotIdentityMock: IPivotIdentity = {
    // scope openid @see https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims
    // eslint-disable-next-line @typescript-eslint/camelcase
    given_name: 'Jean Paul Henri',
    // scope openid @see https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims
    // eslint-disable-next-line @typescript-eslint/camelcase
    family_name: 'Dupont',
    gender: 'male',
    birthdate: '1970-01-01',
    birthplace: '95277',
    birthcountry: '99100',
  };

  const mockHexDigestedHash =
    'bfc2a8804a9b983f47e9abccf8c1b56b848a9a98641d5e79ec06057802c873f0';

  const mockHmacDigestedHash =
    'f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8';

  const ecdsaSignaturesServiceMock = {
    derToJose: jest.fn(),
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

  const mockHash256 = {
    update: jest.fn(),
    digest: jest.fn(),
  };

  const mockHmac = {
    update: jest.fn(),
    digest: jest.fn(),
  };

  const signMock = jest.fn();
  const privateDecryptMock = jest.fn();
  const overridedCryptoMock = {
    sign: signMock,
    privateDecrypt: privateDecryptMock,
  };
  OverrideCode.wrap(overridedCryptoMock, 'sign', 'crypto.sign');
  OverrideCode.wrap(
    overridedCryptoMock,
    'privateDecrypt',
    'crypto.privateDecrypt',
  );

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggerService,
        ConfigService,
        CryptographyService,
        {
          provide: 'CryptographyBroker',
          useValue: brokerMock,
        },
      ],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(ConfigService)
      .useValue(configMock)
      .compile();

    service = module.get<CryptographyService>(CryptographyService);

    jest
      .spyOn(ecdsaSignaturesService, 'derToJose')
      .mockImplementation(ecdsaSignaturesServiceMock.derToJose);

    brokerMock.send.mockReturnValue(messageMock);
    messageMock.subscribe.mockImplementation(cb => cb(brokerResponseMock));
    configMock.get.mockReturnValue({
      payloadEncoding: 'base64',
      commands: {
        CRYPTO_SIGN: 'foo',
      },
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should call broker.connect', () => {
      // When
      service.onModuleInit();
      // Then
      expect(brokerMock.connect).toHaveBeenCalledTimes(1);
    });
  });

  describe('encryptUserInfosCache', () => {
    beforeEach(() => {
      service['encrypt'] = jest.fn().mockReturnValueOnce(mockCipher);
    });

    it('should serialize the given data and encrypt it calling "this.encrypt"', () => {
      // action
      service.encryptUserInfosCache(mockEncryptKey, mockDataToEncrypt);

      // expect
      expect(service['encrypt']).toHaveBeenCalledTimes(1);
      expect(service['encrypt']).toHaveBeenCalledWith(
        mockEncryptKey,
        mockDataToEncrypt,
      );
    });

    it('should return a buffer containing "nonce", "authTag" and "ciphertext" in this order', () => {
      // setup
      const finalCipher = Buffer.concat([
        mockRandomBytes12,
        mockAuthTag16,
        mockCiphertext,
      ]);

      // action
      const result = service.encryptUserInfosCache(
        mockEncryptKey,
        mockDataToEncrypt,
      );

      // expect
      expect(result).toMatchObject(finalCipher);
    });
  });

  describe('decryptUserInfosCache', () => {
    it('should decrypt the given ciphertext calling "this.decrypt" and deserialize it', () => {
      // setup
      service['decrypt'] = jest.fn().mockReturnValueOnce(mockDataToEncrypt);

      // action
      const result = service.decryptUserInfosCache(mockEncryptKey, mockCipher);

      // expect
      expect(service['decrypt']).toHaveBeenCalledTimes(1);
      expect(service['decrypt']).toHaveBeenCalledWith(
        mockEncryptKey,
        mockCipher,
      );
      expect(result).toBe(mockDataToEncrypt);
    });
  });

  describe('decryptClientSecret', () => {
    it('should call decrypt with enc key from config', () => {
      // Given
      const keyMock = 'my key mock';
      const clientSecretMock = 'some string';
      configMock.get.mockReturnValueOnce({ clientSecretEcKey: keyMock });
      service['decrypt'] = jest.fn();
      // When
      service.decryptClientSecret(clientSecretMock);
      // Then
      expect(configMock.get).toHaveBeenCalledTimes(1);
      expect(service['decrypt']).toHaveBeenCalledTimes(1);
      expect(service['decrypt']).toHaveBeenCalledWith(
        keyMock,
        Buffer.from(clientSecretMock, 'base64'),
      );
    });
  });
  describe('computeIdentityHash', () => {
    beforeEach(() => {
      jest
        .spyOn(crypto, 'createHash')
        .mockImplementationOnce(mockCrypto.createHash);
      mockCrypto.createHash.mockReturnValueOnce(mockHash256);

      mockHash256.digest.mockReturnValueOnce(mockHexDigestedHash);
    });

    it('should create a Hash instance with sha256', () => {
      // action
      service.computeIdentityHash(pivotIdentityMock);

      // expect
      expect(mockCrypto.createHash).toHaveBeenCalledTimes(1);
      expect(mockCrypto.createHash).toHaveBeenCalledWith('sha256');
    });

    it('should serialize the given pivot identity and hash it', () => {
      // setup
      const serializedPivotIdentity = JSON.stringify(pivotIdentityMock);

      // action
      service.computeIdentityHash(pivotIdentityMock);

      // expect
      expect(mockHash256.update).toHaveBeenCalledTimes(1);
      expect(mockHash256.update).toHaveBeenCalledWith(serializedPivotIdentity);
    });

    it('should digest the hash to hex format and return the result', () => {
      // action
      const result = service.computeIdentityHash(pivotIdentityMock);

      // expect
      expect(mockHash256.digest).toHaveBeenCalledTimes(1);
      expect(mockHash256.digest).toHaveBeenCalledWith('hex');
      expect(result).toBe(mockHexDigestedHash);
    });

    it('should throw if JSON.stringify throws', () => {
      // Given
      const identityHashMock = {} as IPivotIdentity;
      const error = new TypeError('some bad JSON stuff');
      jest.spyOn(JSON, 'stringify').mockImplementation(() => {
        throw error;
      });
      // When
      const call = () => service.computeIdentityHash(identityHashMock);
      // Then
      expect(call).toThrow(CryptographyComputeIdentityHashException);
      expect(call).toThrow(error);
    });
  });

  describe('computeSubV2', () => {
    beforeEach(() => {
      jest
        .spyOn(crypto, 'createHmac')
        .mockImplementationOnce(mockCrypto.createHmac);
      mockCrypto.createHmac.mockReturnValueOnce(mockHmac);

      mockHmac.digest.mockReturnValueOnce(mockHmacDigestedHash);
    });

    it('should create a Hmac instance with sha256', () => {
      // setup
      const secret = 'shhht!';
      const identityHashMock = 'identityHash';

      // action
      service.computeSubV2(identityHashMock, secret);

      // expect
      expect(mockCrypto.createHmac).toHaveBeenCalledTimes(1);
      expect(mockCrypto.createHmac).toHaveBeenCalledWith('sha256', secret);
    });

    it('should call hmac instance update with identity hash', () => {
      // setup
      const secret = 'shhht!';
      const identityHashMock = 'identityHash';

      // action
      service.computeSubV2(identityHashMock, secret);

      // expect
      expect(mockHmac.update).toHaveBeenCalledTimes(1);
      expect(mockHmac.update).toHaveBeenCalledWith(identityHashMock);
    });

    it('should digest the hmac to hex format and return the result suffixed with the sub version', () => {
      // setup
      const secret = 'shhht!';
      const identityHashMock = 'identityHash';

      // action
      const result = service.computeSubV2(identityHashMock, secret);

      // expect
      expect(mockHmac.digest).toHaveBeenCalledTimes(1);
      expect(mockHmac.digest).toHaveBeenCalledWith('hex');
      expect(result).toBe(`${mockHmacDigestedHash}v2`);
    });
  });

  describe('sign', () => {
    // Given
    const keyMock = 'key';
    const dataMock = Buffer.from('data');
    const digestMock = 'digest';

    /**
     * @TODO refactor tests according to extraction of success and failure callbacks
     */
    describe('sign', () => {
      it('should return promise', async () => {
        // When
        const result = service.sign(keyMock, dataMock, digestMock);
        // Then
        expect(result instanceof Promise);
        // Clean
        await result;
      });
      it('should reject if response is "ERROR"', async () => {
        // Given
        messageMock.subscribe.mockImplementationOnce(cb => cb('ERROR'));
        // Then
        await expect(service.sign(keyMock, dataMock)).rejects.toThrow(
          CryptographyGatewayException,
        );
      });
      it('should reject if something turnd bad', async () => {
        // Given
        messageMock.subscribe.mockImplementationOnce(() => {
          throw Error('not good');
        });
        // Then
        await expect(service.sign(keyMock, dataMock)).rejects.toThrow(
          CryptographyGatewayException,
        );
      });
      it('should reject if observable throws', async () => {
        // Given
        const error = Error('not good');
        messageMock.subscribe.mockImplementationOnce((_success, failure) => {
          failure(error);
        });
        // Then
        await expect(service.sign(keyMock, dataMock)).rejects.toThrow(
          CryptographyGatewayException,
        );
      });
    });
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
      service['encrypt'](mockEncryptKey, mockDataToEncrypt);

      // expect
      expect(mockCrypto.randomBytes).toHaveBeenCalledTimes(1);
      expect(mockCrypto.randomBytes).toHaveBeenCalledWith(randomBytesSize);
    });

    it('should create a cipher instance with aes-256-gcm and 16 bytes authTag', () => {
      // action
      service['encrypt'](mockEncryptKey, mockDataToEncrypt);

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
      service['encrypt'](mockEncryptKey, mockDataToEncrypt);

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
      service['encrypt'](mockEncryptKey, mockDataToEncrypt);

      // expect
      expect(mockCipherGcm.getAuthTag).toHaveBeenCalledTimes(1);
    });

    it('should return a buffer containing "nonce", "authTag" and "ciphertext" in this order', () => {
      // action
      const result = service['encrypt'](mockEncryptKey, mockDataToEncrypt);

      // expect
      expect(result).toMatchObject(
        Buffer.concat([mockRandomBytes12, mockAuthTag16, mockCiphertext]),
      );
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
      //setup
      const WRONG_CIPHER = Buffer.from('LOWER_THAN_28_BYTES_STRING', 'utf8');

      // action
      try {
        service['decrypt'](mockEncryptKey, WRONG_CIPHER);
      } catch (e) {
        // expect
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe('Authentication failed !');
      }

      // expect
      expect.hasAssertions();
    });

    it('should throw an error when given cipher length is equal to cipher head length', () => {
      //setup
      const WRONG_CIPHER = Buffer.from('------28_BYTES_STRING-------', 'utf8');

      // action
      try {
        service['decrypt'](mockEncryptKey, WRONG_CIPHER);
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
      service['decrypt'](mockEncryptKey, mockCipher);

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
      service['decrypt'](mockEncryptKey, mockCipher);

      // expect
      expect(mockDecipherGcm.setAuthTag).toHaveBeenCalledTimes(1);
      expect(mockDecipherGcm.setAuthTag).toHaveBeenCalledWith(mockAuthTag16);
    });

    it('should decrypt the given ciphertext using the cipher instance', () => {
      // action
      const result = service['decrypt'](mockEncryptKey, mockCipher);

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
        service['decrypt'](mockEncryptKey, mockCipher);
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
