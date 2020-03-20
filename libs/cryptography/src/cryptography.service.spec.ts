import { Test, TestingModule } from '@nestjs/testing';
import * as crypto from 'crypto';
import * as ecdsaSignaturesService from 'jose/lib/help/ecdsa_signatures';
import { CryptographyService } from './cryptography.service';
import { IPivotIdentity } from './interfaces';
import { GATEWAY } from './tokens';

describe('CryptographyService', () => {
  let service: CryptographyService;

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

  const mockDerSignature = Buffer.from(
    '6d98490c6f1acddd448e45954f77679369475baa6d98490c6f1acddd448e45954f77679369475baa',
    'hex',
  );
  const mockUnsignedJwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ';
  const mockJoseSignature = Buffer.from(
    'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    'utf8',
  );

  const mockSignedJwt = Buffer.from(
    `${mockUnsignedJwt}.${mockJoseSignature.toString('utf8')}`,
  );

  const gatewayMock = {
    sign: jest.fn(),
  };

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

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CryptographyService,
        {
          provide: GATEWAY,
          useValue: gatewayMock,
        },
      ],
    }).compile();

    service = module.get<CryptographyService>(CryptographyService);

    jest.spyOn(ecdsaSignaturesService, 'derToJose').mockImplementation(
      ecdsaSignaturesServiceMock.derToJose,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('encryptUserInfosCache', () => {  
    beforeEach(() => {
      jest
        .spyOn(crypto, 'randomBytes')
        .mockImplementationOnce(mockCrypto.randomBytes);
      mockCrypto.randomBytes.mockReturnValueOnce(mockRandomBytes12);
      
      jest
        .spyOn(crypto, 'createCipheriv')
        .mockImplementationOnce(mockCrypto.createCipheriv);
      mockCrypto.createCipheriv.mockReturnValueOnce(mockCipherGcm)
      mockCipherGcm.update.mockReturnValueOnce(mockCiphertext);
      mockCipherGcm.getAuthTag.mockReturnValueOnce(mockAuthTag16);
    });

    it('should generate a 12 bytes nonce by calling crypto.randomBytes', () => {
      // action
      service.encryptUserInfosCache(mockEncryptKey, mockData);

      // expect
      expect(mockCrypto.randomBytes).toHaveBeenCalledTimes(1);
      expect(mockCrypto.randomBytes).toHaveBeenCalledWith(12);
    });

    it('should create a cipher instance with aes-256-gcm and 16 bytes authTag', () => {
      // action
      service.encryptUserInfosCache(mockEncryptKey, mockData);

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

    it('should serialize the given data and encrypt it using the cipher instance', () => {
      // action
      service.encryptUserInfosCache(mockEncryptKey, mockData);

      // expect
      expect(mockCipherGcm.update).toHaveBeenCalledTimes(1);
      expect(mockCipherGcm.update).toHaveBeenCalledWith(mockDataToEncrypt, 'utf8');
      expect(mockCipherGcm.final).toHaveBeenCalledTimes(1);
    });

    it('should get the authTag from the cipher instance', () => {
      // action
      service.encryptUserInfosCache(mockEncryptKey, mockData);

      // expect
      expect(mockCipherGcm.getAuthTag).toHaveBeenCalledTimes(1);
    });

    it('should return a buffer containing "nonce", "authTag" and "ciphertext" in this order', () => {
      // action
      const result = service.encryptUserInfosCache(mockEncryptKey, mockData);

      // expect
      expect(result).toMatchObject(Buffer.concat([
        mockRandomBytes12,
        mockAuthTag16,
        mockCiphertext,
      ]));
    });
  });

  describe('decryptUserInfosCache', () => {
    beforeEach(() => {
      jest
        .spyOn(crypto, 'createDecipheriv')
        .mockImplementationOnce(mockCrypto.createDecipheriv);
      mockCrypto.createDecipheriv.mockReturnValueOnce(mockDecipherGcm)
      mockDecipherGcm.update.mockReturnValueOnce(mockDecryptedData);
    });

    it('should throw an error when given cipher length is lower than cipher head length', () => {
      //setup
      const WRONG_CIPHER = Buffer.from('LOWER_THAN_28_BYTES_STRING', 'utf8');

      // action
      try {
        service.decryptUserInfosCache(mockEncryptKey, WRONG_CIPHER);
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
        service.decryptUserInfosCache(mockEncryptKey, WRONG_CIPHER);
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
      service.decryptUserInfosCache(mockEncryptKey, mockCipher);

      // expect
      expect(mockCrypto.createDecipheriv).toHaveBeenCalledTimes(1);
      expect(mockCrypto.createDecipheriv).toHaveBeenCalledWith(
        'aes-256-gcm',
        mockEncryptKey,
        mockRandomBytes12,
        {
          authTagLength: 16,
        }
      );
    });

    it('should set authenthication tag retrieved from the cipher', () => {
      // action
      service.decryptUserInfosCache(mockEncryptKey, mockCipher);

      // expect
      expect(mockDecipherGcm.setAuthTag).toHaveBeenCalledTimes(1);
      expect(mockDecipherGcm.setAuthTag).toHaveBeenCalledWith(mockAuthTag16);
    });

    it('should decrypt the given ciphertext using the cipher instance and deserialize it', () => {
      // action
      const result = service.decryptUserInfosCache(mockEncryptKey, mockCipher);

      // expect
      expect(mockDecipherGcm.update).toHaveBeenCalledTimes(1);
      expect(mockDecipherGcm.update).toHaveBeenCalledWith(
        mockCiphertext,
        null,
        'utf8'
      );
      expect(mockDecipherGcm.final).toHaveBeenCalledTimes(1);
      expect(result).toMatchObject(mockData);
    });

    it('should throw authentication error when cipher final fail', () => {
      // setup
      mockDecipherGcm.final.mockImplementationOnce(() => {
        throw new Error('Christmas is cancelled !');
      });

      // action
      try {
        service.decryptUserInfosCache(mockEncryptKey, mockCipher);
      } catch (e) {
        // expect
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe('Authentication failed !');
      }

      // expect
      expect.hasAssertions();
    });
  });

  describe('computeIdentityHash', () => {
    beforeEach(() => {
      jest.spyOn(crypto, 'createHash').mockImplementationOnce(mockCrypto.createHash);
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
  });

  describe('computeSubV2', () => {
    beforeEach(() => {
      jest.spyOn(crypto, 'createHmac').mockImplementationOnce(mockCrypto.createHmac);
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
    })
  });

  describe('decryptJwt', () => {
    it('should resolve', async () => {
      // action
      const result = service.decryptJwt(
        'privateKey',
        Buffer.from('cipherWithRsaPkcsOaep', 'utf8'),
      );

      // expect
      expect(result).toBeInstanceOf(Promise);
    });

    it('should decrypt, given a JWT and a private key', async () => {
      // action
      const result = await service.decryptJwt(
        'privateKey',
        Buffer.from('cipherWithRsaPkcsOaep', 'utf8'),
      );

      // expect
      expect(result).toMatchObject(Buffer.from('jwt', 'utf8'));
    });
  });

  describe('signJwt', () => {
    beforeEach(() => {
      gatewayMock.sign.mockReturnValueOnce(mockDerSignature);
      ecdsaSignaturesServiceMock.derToJose.mockReturnValueOnce(mockJoseSignature);
    });

    it('should resolve', async () => {
      // action
      const result = service.signJwt(
        'privateKey',
        mockUnsignedJwt,
      );

      // expect
      expect(result).toBeInstanceOf(Promise);
    });

    it('should sign, given a JWT and a private key', async () => {
      // action
      const result = await service.signJwt(
        'privateKey',
        mockUnsignedJwt,
      );

      // expect
      expect(result).toBe(mockSignedJwt.toString('utf8'));
    });

    it('should use the gateway to get the signature der formatted', async () => {
      // action
      await service.signJwt(
        'privateKey',
        mockUnsignedJwt,
      );

      // expect
      expect(gatewayMock.sign).toHaveBeenCalledTimes(1);
      expect(gatewayMock.sign).toHaveBeenCalledWith('privateKey', Buffer.from(mockUnsignedJwt, 'utf8'));
    });

    it('should convert the der signature to jose format', async () => {
      // action
      await service.signJwt(
        'privateKey',
        mockUnsignedJwt,
      );

      // expect
      expect(ecdsaSignaturesServiceMock.derToJose).toHaveBeenCalledTimes(1);
      expect(ecdsaSignaturesServiceMock.derToJose).toHaveBeenCalledWith(mockDerSignature, 'ES256');
    });
  });
});
