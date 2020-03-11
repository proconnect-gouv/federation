import { Test, TestingModule } from '@nestjs/testing';
import { CryptographyService } from './cryptography.service';
import { IPivotIdentity } from './interfaces';

describe('CryptographyService', () => {
  let service: CryptographyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptographyService],
    }).compile();

    service = module.get<CryptographyService>(CryptographyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateState', () => {
    it('should resolve', async () => {
      // action
      const result = service.generateState();

      // expect
      expect(result).toBeInstanceOf(Promise);
    });

    it('should return string with 64 characters', async () => {
      // action
      const result = await service.generateState();

      // expect
      expect(result).toHaveLength(64);
    });
  });

  describe('generateNonce', () => {
    it('should resolve', async () => {
      // action
      const result = service.generateNonce();

      // expect
      expect(result).toBeInstanceOf(Promise);
    });

    it('should return string with 64 characters', async () => {
      // action
      const result = await service.generateNonce();

      // expect
      expect(result).toHaveLength(64);
    });
  });

  describe('encryptUserInfosCache', () => {
    it('should resolve', async () => {
      // action
      const result = service.encryptUserInfosCache(
        Buffer.from('data', 'utf8'),
      );

      // expect
      expect(result).toBeInstanceOf(Promise);
    });

    it('should return string with 64 characters', async () => {
      // action
      const result = await service.encryptUserInfosCache(
        Buffer.from('data', 'utf8'),
      );

      // expect
      expect(result).toMatchObject(Buffer.from('cipherWithAes256Gcm', 'utf8'));
    });
  });

  describe('decryptUserInfosCache', () => {
    it('should resolve', async () => {
      // action
      const result = service.decryptUserInfosCache(Buffer.from('cipherWithAes256Gcm', 'utf8'));

      // expect
      expect(result).toBeInstanceOf(Promise);
    });

    it('should return string with 64 characters', async () => {
      // action
      const result = await service.decryptUserInfosCache(Buffer.from('cipherWithAes256Gcm', 'utf8'));

      // expect
      expect(result).toMatchObject(Buffer.from('data', 'utf8'));
    });
  });

  describe('computeIdentityHash', () => {
    it('should return the correct identity hash, given a pivot identity', () => {
      // setup
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

      // action
      const result = service.computeIdentityHash(pivotIdentityMock);

      // expect
      expect(result).toBe('identityHash');
    });
  });

  describe('computeSub', () => {
    it('should return the correct sub, given an identity hash and a client id', () => {
      // setup
      const clientId = 'client_id';
      const identityHashMock = 'identityHash';

      // action
      const result = service.computeSub(identityHashMock, clientId);

      // expect
      expect(result).toBe('sub');
    });
  });

  describe('decryptJwt', () => {
    it('should resolve', async () => {
      // action
      const result = service.decryptJwt(
        Buffer.from('cipherWithRsaPkcsOaep', 'utf8'),
        Buffer.from('privateKey', 'utf8'),
      );

      // expect
      expect(result).toBeInstanceOf(Promise);
    });

    it('should decrypt, given a JWT and a private key', async () => {
      // action
      const result = await service.decryptJwt(
        Buffer.from('cipherWithRsaPkcsOaep', 'utf8'),
        Buffer.from('privateKey', 'utf8'),
      );

      // expect
      expect(result).toMatchObject(Buffer.from('jwt', 'utf8'));
    });
  });

  describe('signJwt', () => {
    it('should resolve', async () => {
      // action
      const result = service.signJwt(
        'jwt',
        Buffer.from('privateKey', 'utf8'),
      );

      // expect
      expect(result).toBeInstanceOf(Promise);
    });

    it('should decrypt, given a JWT and a private key', async () => {
      // action
      const result = await service.signJwt(
        'jwt',
        Buffer.from('privateKey', 'utf8'),
      );

      // expect
      expect(result).toBe('jwtSignedWithEcdsaPrime256v1');
    });
  });

  describe('generateLocalRandomString', () => {
    it('should resolve', async () => {
      // action
      const result = service['generateLocalRandomString']();

      // expect
      expect(result).toBeInstanceOf(Promise);
    });

    it('should return string with 64 characters by default' , async () => {
      // action
      const result = await service['generateLocalRandomString']();

      // expect
      expect(result).toHaveLength(64);
    });

    it('should return string with 32 characters', async () => {
      // action
      const result = await service['generateLocalRandomString'](32);

      // expect
      expect(result).toHaveLength(32);
    });
  });
});
