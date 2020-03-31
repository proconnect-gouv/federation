import * as crypto from 'crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { CryptographyGatewayHighService } from './cryptography-gateway-high.service';
import * as pkcs11js from 'pkcs11js';
import { SignatureDigest } from './enums';

/**
 *  Support EC key prime field up to 521 bits
 *  @see https://en.wikipedia.org/wiki/Elliptic-curve_cryptography
 *  /!\ Do not modify without understanding the basics of the upper link /!\
 */
const MAX_SIG_OUTPUT_SIZE = 132;

describe('CryptographyGatewayHighService', () => {
  let service: CryptographyGatewayHighService;

  // Camel case is disabled here beacause of PKCS#11 implementation
  const mockPkcs11Instance = {
    load: jest.fn(),
    // eslint-disable-next-line @typescript-eslint/camelcase
    C_Initialize: jest.fn(),
    // eslint-disable-next-line @typescript-eslint/camelcase
    C_GetSlotList: jest.fn(),
    // eslint-disable-next-line @typescript-eslint/camelcase
    C_OpenSession: jest.fn(),
    // eslint-disable-next-line @typescript-eslint/camelcase
    C_Login: jest.fn(),
    // eslint-disable-next-line @typescript-eslint/camelcase
    C_SignInit: jest.fn(),
    // eslint-disable-next-line @typescript-eslint/camelcase
    C_Sign: jest.fn(),
    // eslint-disable-next-line @typescript-eslint/camelcase
    C_DecryptInit: jest.fn(),
    // eslint-disable-next-line @typescript-eslint/camelcase
    C_Decrypt: jest.fn(),
    // eslint-disable-next-line @typescript-eslint/camelcase
    C_FindObjectsInit: jest.fn(),
    // eslint-disable-next-line @typescript-eslint/camelcase
    C_FindObjects: jest.fn(),
    // eslint-disable-next-line @typescript-eslint/camelcase
    C_FindObjectsFinal: jest.fn(),
    // eslint-disable-next-line @typescript-eslint/camelcase
    C_Finalize: jest.fn(),
  };

  const mockPin = 'admin';
  const mockLibHsmPath = '../tw_proteccio/pkcs11_api/nethsm/client/sharedlib64/libnethsm.so';

  const mockSlotList = [Buffer.from('*')];
  const mockKeySlot = Buffer.from('0');

  const mockHsmSession = 'If you concentrate you can imagine this is a session';
  
  const mockCipher = Buffer.from('! eil a si ekac ehT', 'utf8');
  const mockData = Buffer.from('The cake is a lie !', 'utf8');
  const sha256Digest = Buffer.from('59d2da2a2781004e917f3aaadf7ac9b0db31bcf81fbcf7ed391227b18bd7ff22', 'hex');

  const ckaSigLabel = 'sig-key-prime256v1';
  const ckaEncLabel = 'enc-key-prime256v1';

  const mockRawSignature = Buffer.from('raw', 'utf8');
  const mockDerSignature = Buffer.from('well-done', 'utf8');

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    jest.spyOn(pkcs11js, 'PKCS11').mockImplementation(function mockPkcs11() {
      return mockPkcs11Instance as unknown as pkcs11js.PKCS11;
    });

    jest.spyOn(crypto, 'createHash');
    jest.spyOn(crypto.Hash.prototype, 'update');
    jest.spyOn(crypto.Hash.prototype, 'digest');

    mockPkcs11Instance.C_GetSlotList.mockReturnValue(mockSlotList);

    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptographyGatewayHighService],
    }).compile();

    service = module.get<CryptographyGatewayHighService>(CryptographyGatewayHighService);
    // The testing module is not calling application lifecycle hooks
    service.onModuleInit();

    // Will reset the counts altered by the "onModuleInit" call
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should call instanciatePkcs11js with the shared library', async () => {
      const originalInstanciatePkcs11js = service['instanciatePkcs11js'];
      service['instanciatePkcs11js'] = jest.fn();
      const originalOpenSessionWithTheHsm = service['openSessionWithTheHsm'];
      service['openSessionWithTheHsm'] = jest.fn();
      const originalAuthenticateWithTheHsm = service['authenticateWithTheHsm'];
      service['authenticateWithTheHsm'] = jest.fn();

      // action
      service.onModuleInit();

      // expect
      expect(service['instanciatePkcs11js']).toHaveBeenCalledTimes(1);
      expect(service['instanciatePkcs11js']).toHaveBeenCalledWith(mockLibHsmPath);

      // restore
      service['instanciatePkcs11js'] = originalInstanciatePkcs11js;
      service['openSessionWithTheHsm'] = originalOpenSessionWithTheHsm;
      service['authenticateWithTheHsm'] = originalAuthenticateWithTheHsm;
    });

    it('should store the PKCS#11 instance in a private attribute', async () => {
      const originalInstanciatePkcs11js = service['instanciatePkcs11js'];
      service['instanciatePkcs11js'] = jest.fn().mockReturnValueOnce(mockPkcs11Instance);
      const originalOpenSessionWithTheHsm = service['openSessionWithTheHsm'];
      service['openSessionWithTheHsm'] = jest.fn();
      const originalAuthenticateWithTheHsm = service['authenticateWithTheHsm'];
      service['authenticateWithTheHsm'] = jest.fn();


      // action
      service.onModuleInit();

      // expect
      expect(service['pkcs11Instance']).toBe(mockPkcs11Instance);

      // restore
      service['instanciatePkcs11js'] = originalInstanciatePkcs11js;
      service['openSessionWithTheHsm'] = originalOpenSessionWithTheHsm;
      service['authenticateWithTheHsm'] = originalAuthenticateWithTheHsm;
    });

    it('should call openSessionWithTheHsm', async () => {
      const originalInstanciatePkcs11js = service['instanciatePkcs11js'];
      service['instanciatePkcs11js'] = jest.fn();
      const originalOpenSessionWithTheHsm = service['openSessionWithTheHsm'];
      service['openSessionWithTheHsm'] = jest.fn();
      const originalAuthenticateWithTheHsm = service['authenticateWithTheHsm'];
      service['authenticateWithTheHsm'] = jest.fn();

      // action
      service.onModuleInit();

      // expect
      expect(service['openSessionWithTheHsm']).toHaveBeenCalledTimes(1);

      // restore
      service['instanciatePkcs11js'] = originalInstanciatePkcs11js;
      service['openSessionWithTheHsm'] = originalOpenSessionWithTheHsm;
      service['authenticateWithTheHsm'] = originalAuthenticateWithTheHsm;
    });

    it('should store the PKCS#11 session it in a private attribute', () => {
      // setup
      const originalInstanciatePkcs11js = service['instanciatePkcs11js'];
      service['instanciatePkcs11js'] = jest.fn();
      const originalOpenSessionWithTheHsm = service['openSessionWithTheHsm'];
      service['openSessionWithTheHsm'] = jest.fn().mockReturnValueOnce(mockHsmSession);
      const originalAuthenticateWithTheHsm = service['authenticateWithTheHsm'];
      service['authenticateWithTheHsm'] = jest.fn();


      // action
      service.onModuleInit();

      // expect
      expect(service['pkcs11Session']).toStrictEqual(mockHsmSession);

      // restore
      service['instanciatePkcs11js'] = originalInstanciatePkcs11js;
      service['openSessionWithTheHsm'] = originalOpenSessionWithTheHsm;
      service['authenticateWithTheHsm'] = originalAuthenticateWithTheHsm;
    });

    it('should call authenticateWithTheHsm', async () => {
      const originalInstanciatePkcs11js = service['instanciatePkcs11js'];
      service['instanciatePkcs11js'] = jest.fn();
      const originalOpenSessionWithTheHsm = service['openSessionWithTheHsm'];
      service['openSessionWithTheHsm'] = jest.fn();
      const originalAuthenticateWithTheHsm = service['authenticateWithTheHsm'];
      service['authenticateWithTheHsm'] = jest.fn();

      // action
      service.onModuleInit();

      // expect
      expect(service['authenticateWithTheHsm']).toHaveBeenCalledTimes(1);

      // restore
      service['instanciatePkcs11js'] = originalInstanciatePkcs11js;
      service['openSessionWithTheHsm'] = originalOpenSessionWithTheHsm;
      service['authenticateWithTheHsm'] = originalAuthenticateWithTheHsm;
    });
  });

  describe('onModuleClose', () => {
    it('should call closeCurrentSessionWithTheHsm', async () => {
      const originalCloseCurrentSessionWithTheHsm = service['closeCurrentSessionWithTheHsm'];
      service['closeCurrentSessionWithTheHsm'] = jest.fn();

      // action
      service.onModuleDestroy();

      // expect
      expect(service['closeCurrentSessionWithTheHsm']).toHaveBeenCalledTimes(1);

      // restore
      service['closeCurrentSessionWithTheHsm'] = originalCloseCurrentSessionWithTheHsm;
    });
  });

  describe('sign', () => {
    it('should hash the data with the given digest algo prior to sign', async () => {
      // setup
      mockPkcs11Instance.C_Sign.mockReturnValueOnce(mockRawSignature);

      // action
      await service['sign'](ckaSigLabel, mockData);

      // expect
      expect(crypto.createHash).toHaveBeenCalledTimes(1);
      expect(crypto.createHash).toHaveBeenCalledWith(SignatureDigest.SHA256);
      expect(crypto.Hash.prototype.update).toHaveBeenCalledTimes(1);
      expect(crypto.Hash.prototype.update).toHaveBeenCalledWith(mockData);
      expect(crypto.Hash.prototype.digest).toHaveBeenCalledTimes(1);
    });

    it('should call getPrivateKeySlotByLabel with the given CKA_LABEL', async () => {
      // setup
      mockPkcs11Instance.C_Sign.mockReturnValueOnce(mockRawSignature);
      const originalGetPrivateKeySlotByLabel = service['getPrivateKeySlotByLabel'];
      service['getPrivateKeySlotByLabel'] = jest.fn();

      // action
      await service['sign'](ckaSigLabel, mockData);

      // expect
      expect(service['getPrivateKeySlotByLabel']).toHaveBeenCalledTimes(1);
      expect(service['getPrivateKeySlotByLabel']).toHaveBeenCalledWith(ckaSigLabel);

      // restore
      service['getPrivateKeySlotByLabel'] = originalGetPrivateKeySlotByLabel;
    });

    it('should call C_SignInit with the PKCS#11 session, the CKM_ECDSA mekanism and the key slot returned by getPrivateKeySlotByLabel', async () => {
      // setup
      mockPkcs11Instance.C_Sign.mockReturnValueOnce(mockRawSignature);
      const originalGetPrivateKeySlotByLabel = service['getPrivateKeySlotByLabel'];
      service['getPrivateKeySlotByLabel'] = jest.fn().mockReturnValueOnce(mockKeySlot);

      // action
      await service['sign'](ckaSigLabel, mockData);

      // expect
      expect(mockPkcs11Instance.C_SignInit).toHaveBeenCalledTimes(1);
      expect(mockPkcs11Instance.C_SignInit).toHaveBeenCalledWith(
        service['pkcs11Session'],
        {
          mechanism: pkcs11js.CKM_ECDSA,
        },
        mockKeySlot,
      );

      // restore
      service['getPrivateKeySlotByLabel'] = originalGetPrivateKeySlotByLabel;
    });

    it('should call C_Sign with the PKCS#11 session, the dataDigest, and a Buffer sizeof MAX_SIG_OUTPUT_SIZE', async () => {
      // setup
      mockPkcs11Instance.C_Sign.mockReturnValueOnce(mockRawSignature);

      // action
      await service['sign'](ckaEncLabel, mockData);

      // expect
      expect(mockPkcs11Instance.C_Sign).toHaveBeenCalledTimes(1);
      expect(mockPkcs11Instance.C_Sign).toHaveBeenCalledWith(
        service['pkcs11Session'],
        sha256Digest,
        Buffer.alloc(MAX_SIG_OUTPUT_SIZE),
      );
    });

    it('should encode and the signature to openssl ASN.1 DER format', async () => {
      // setup
      mockPkcs11Instance.C_Sign.mockReturnValueOnce(mockRawSignature);
      const originalEncodeRSToAsn1 = service['encodeRSToAsn1'];
      service['encodeRSToAsn1'] = jest.fn().mockReturnValueOnce(mockDerSignature);

      // action
      const result = await service['sign'](ckaSigLabel, mockData);

      // expect
      expect(result).toStrictEqual(mockDerSignature);

      // restore
      service['encodeRSToAsn1'] = originalEncodeRSToAsn1;
    });

    it('should throw a "E_SIG_NOT_FOUND" error if C_Sign does not return a Buffer', async () => {
      // setup
      mockPkcs11Instance.C_Sign.mockReturnValueOnce(undefined);

      // action
      try {
        await service['sign'](ckaSigLabel, mockData);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toStrictEqual('E_SIG_NOT_FOUND');
      }
      
      // expect
      expect.hasAssertions();
    });

    it('should throw a "E_SIG_NOT_FOUND" error if C_Sign returns an empty Buffer', async () => {
      // setup
      mockPkcs11Instance.C_Sign.mockReturnValueOnce(Buffer.alloc(0));

      // action
      try {
        await service['sign'](ckaSigLabel, mockData);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toStrictEqual('E_SIG_NOT_FOUND');
      }

      // expect
      expect.hasAssertions();
    });
  });

  describe('privateDecrypt', () => {
    it('should call getPrivateKeySlotByLabel with the given CKA_LABEL', async () => {
      // setup
      const originalGetPrivateKeySlotByLabel = service['getPrivateKeySlotByLabel'];
      service['getPrivateKeySlotByLabel'] = jest.fn();

      // action
      await service['privateDecrypt'](ckaEncLabel, mockCipher);

      // expect
      expect(service['getPrivateKeySlotByLabel']).toHaveBeenCalledTimes(1);
      expect(service['getPrivateKeySlotByLabel']).toHaveBeenCalledWith(ckaEncLabel);

      // restore
      service['getPrivateKeySlotByLabel'] = originalGetPrivateKeySlotByLabel;
    });

    it('should call C_DecryptInit with the PKCS#11 session, the CKM_RSA_PKCS_OAEP mekanism and the key slot returned by getPrivateKeySlotByLabel', async () => {
      // setup
      const originalGetPrivateKeySlotByLabel = service['getPrivateKeySlotByLabel'];
      service['getPrivateKeySlotByLabel'] = jest.fn().mockReturnValueOnce(mockKeySlot);

      // action
      await service['privateDecrypt'](ckaEncLabel, mockCipher);

      // expect
      expect(mockPkcs11Instance.C_DecryptInit).toHaveBeenCalledTimes(1);
      expect(mockPkcs11Instance.C_DecryptInit).toHaveBeenCalledWith(
        service['pkcs11Session'],
        {
          mechanism: pkcs11js.CKM_RSA_PKCS_OAEP,
        },
        mockKeySlot,
      );

      // restore
      service['getPrivateKeySlotByLabel'] = originalGetPrivateKeySlotByLabel;
    });

    it('should call C_Decrypt with the PKCS#11 session, the cipher, and a Buffer sizeof cipher.byteLength', async () => {
      // action
      await service['privateDecrypt'](ckaEncLabel, mockCipher);

      // expect
      expect(mockPkcs11Instance.C_Decrypt).toHaveBeenCalledTimes(1);
      expect(mockPkcs11Instance.C_Decrypt).toHaveBeenCalledWith(
        service['pkcs11Session'],
        mockCipher,
        Buffer.alloc(mockCipher.byteLength),
      );
    });

    it('should return the data deciphered', async () => {
      // setup
      mockPkcs11Instance.C_Decrypt.mockReturnValueOnce(mockData);

      // action
      const result = await service['privateDecrypt'](ckaEncLabel, mockCipher);

      // expect
      expect(result).toStrictEqual(mockData);
    });
  });

  describe('instanciatePkcs11js', () => {
    it('should create a PKCS#11 Instance', () => {
      // action
      service['instanciatePkcs11js'](mockLibHsmPath);

      // expect
      expect(pkcs11js.PKCS11).toHaveBeenCalledTimes(1);
    });

    it('should load the nethsm library', () => {
      // action
      service['instanciatePkcs11js'](mockLibHsmPath);

      // expect
      expect(mockPkcs11Instance.load).toHaveBeenCalledTimes(1);
      expect(mockPkcs11Instance.load).toHaveBeenCalledWith(mockLibHsmPath);
    });

    it('should initialize the PKCS#11 instance', () => {
      // action
      service['instanciatePkcs11js'](mockLibHsmPath);

      // expect
      expect(mockPkcs11Instance.C_Initialize).toHaveBeenCalledTimes(1);
    });

    it('should return the PKCS#11 Instance', () => {
      // action
      const result = service['instanciatePkcs11js'](mockLibHsmPath);

      // expect
      expect(result).toBe(mockPkcs11Instance);
    });
  })

  describe('openSessionWithTheHsm', () => {
    it('should retrieve only the slots with tokens from the PKCS#11 instance', () => {
      const tokenPresent = true;
      
      // action
      service['openSessionWithTheHsm']();

      // expect
      expect(mockPkcs11Instance.C_GetSlotList).toHaveBeenCalledTimes(1);
      expect(mockPkcs11Instance.C_GetSlotList).toHaveBeenCalledWith(tokenPresent);
    });

    it('should open a read-only session with the first slot found', () => {
      // action
      service['openSessionWithTheHsm']();

      // expect
      expect(mockPkcs11Instance.C_OpenSession).toHaveBeenCalledTimes(1);
      expect(mockPkcs11Instance.C_OpenSession).toHaveBeenCalledWith(
        mockSlotList[0],
        pkcs11js.CKF_SERIAL_SESSION,
      );
    });

    it('should return the PKCS#11 session', () => {
      // setup
      mockPkcs11Instance.C_OpenSession.mockReturnValueOnce(
        mockHsmSession,
      );

      // action
      const result = service['openSessionWithTheHsm']();

      // expect
      expect(result).toStrictEqual(mockHsmSession);
    });
  });

  describe('closeCurrentSessionWithTheHsm', () => {
    it('should call C_Finalize to destroy the instance', () => {
      // action
      service['closeCurrentSessionWithTheHsm']();

      // expect
      expect(mockPkcs11Instance.C_Finalize).toHaveBeenCalledTimes(1);
    });
  });

  describe('authenticateWithTheHsm', () => {
    it('should call C_Login with the HSM session, the user type "CKU_USER" and the mockPin', () => {
      // action
      service['authenticateWithTheHsm']();

      // expect
      expect(mockPkcs11Instance.C_Login).toHaveBeenCalledTimes(1);
      expect(mockPkcs11Instance.C_Login).toHaveBeenCalledWith(
        service['pkcs11Session'],
        pkcs11js.CKU_USER,
        mockPin,
      );
    });
  });

  describe('getPrivateKeySlotByLabel', () => {
    it('should return the first matching slot', () => {
      // setup
      mockPkcs11Instance.C_FindObjects.mockReturnValueOnce(mockKeySlot);

      // action
      const result = service['getPrivateKeySlotByLabel'](ckaSigLabel);

      // expect
      expect(result).toBe(mockKeySlot);
    });

    it('C_FindObjectsInit shall have been called with the PKCS#11 session, the key type "private" and the key label', () => {
      // setup
      const expectedTemplate = [
        { type: pkcs11js.CKA_KEY_TYPE, value: pkcs11js.CKO_PRIVATE_KEY },
        { type: pkcs11js.CKA_LABEL, value: Buffer.from(ckaSigLabel, 'utf8') },
      ];

      // action
      service['getPrivateKeySlotByLabel'](ckaSigLabel);

      // expect
      expect(mockPkcs11Instance.C_FindObjectsInit).toHaveBeenCalledTimes(1);
      expect(mockPkcs11Instance.C_FindObjectsInit).toHaveBeenCalledWith(
        service['pkcs11Session'],
        expectedTemplate,
      );
    });

    it('C_FindObjects shall have been called with the PKCS#11 session', () => {
      // action
      service['getPrivateKeySlotByLabel'](ckaSigLabel);

      // expect
      expect(mockPkcs11Instance.C_FindObjects).toHaveBeenCalledTimes(1);
      expect(mockPkcs11Instance.C_FindObjects).toHaveBeenCalledWith(service['pkcs11Session']);
    });

    it('C_FindObjectsFinal shall have been called with the PKCS#11 session', () => {
      // action
      service['getPrivateKeySlotByLabel'](ckaSigLabel);

      // expect
      expect(mockPkcs11Instance.C_FindObjectsFinal).toHaveBeenCalledTimes(1);
      expect(mockPkcs11Instance.C_FindObjectsFinal).toHaveBeenCalledWith(service['pkcs11Session']);
    });

    it('C_FindObjectsFinal shall have been called with the PKCS#11 session even if C_FindObjects throws', () => {
      // setup
      mockPkcs11Instance.C_FindObjects.mockImplementationOnce(
        () => {
          throw new Error('C_FindObjects throw');
        }
      );

      // action
      try {
        service['getPrivateKeySlotByLabel'](ckaSigLabel);
      } catch (e) {
        // expect
        expect(mockPkcs11Instance.C_FindObjectsFinal).toHaveBeenCalledTimes(1);
        expect(mockPkcs11Instance.C_FindObjectsFinal).toHaveBeenCalledWith(service['pkcs11Session']);
      }

      // expect
      expect.hasAssertions();
    });

    it('should throw C_FindObjects error if C_FindObjects throws', () => {
      // setup
      mockPkcs11Instance.C_FindObjects.mockImplementationOnce(
        () => {
          throw new Error('C_FindObjects throw');
        }
      );

      // action
      try {
        service['getPrivateKeySlotByLabel'](ckaSigLabel);
      } catch (e) {
        // expect
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe('C_FindObjects throw');
      }

      // expect
      expect.hasAssertions();
    });
  });

  describe('encodeRSToAsn1', () => {
    it('should return a der ASN.1 encoded signature, given a raw (r, s) concatened pair', async () => {
      // setup
      const rawSignature = Buffer.from('06df97d14a692879e2807821743591fd92e75a9bdde74f72d183a6a09f4b414dca75c62116f7c1d8b6927a2e7271577bd2153386a2286a88fd66cee7a43e8a07', 'hex');
      const expected = Buffer.from('3045022006df97d14a692879e2807821743591fd92e75a9bdde74f72d183a6a09f4b414d022100ca75c62116f7c1d8b6927a2e7271577bd2153386a2286a88fd66cee7a43e8a07', 'hex');

      // action
      const result = service['encodeRSToAsn1'](rawSignature);

      // expect
      expect(result).toEqual(expected);
    });

    it('should return only ASN.1 metadata since r and s equal 0', () => {
      // setup
      const rawSignature = Buffer.from('00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000', 'hex');
      const expected = Buffer.from('300402000200', 'hex');

      // action
      const result = service['encodeRSToAsn1'](rawSignature);

      // expect
      expect(result).toEqual(expected);
    });

    it('should remove all "0" start padding bytes from r', () =>{
      // setup
      const rawSignature = Buffer.from('00000000000000000000000000000000000000000000000000000000000000012222222222222222222222222222222222222222222222222222222222222222', 'hex');
      const expected = Buffer.from('302502010102202222222222222222222222222222222222222222222222222222222222222222', 'hex');

      // action
      const result = service['encodeRSToAsn1'](rawSignature);

      // expect
      expect(result).toEqual(expected);
    });

    it('should remove all "0" start padding bytes from s', () => {
      // setup
      const rawSignature = Buffer.from('22222222222222222222222222222222222222222222222222222222222222220000000000000000000000000000000000000000000000000000000000000001', 'hex');
      const expected = Buffer.from('302502202222222222222222222222222222222222222222222222222222222222222222020101', 'hex');

      // action
      const result = service['encodeRSToAsn1'](rawSignature);

      // expect
      expect(result).toEqual(expected);
    });

    it('should add a single "0" first byte to r if r first byte has a value greater than 127 and there was no "0" start byte padding', () => {
      // setup
      const rawSignature = Buffer.from('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000000000001', 'hex');
      const expected = Buffer.from('3026022100ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff020101', 'hex');

      // action
      const result = service['encodeRSToAsn1'](rawSignature);

      // expect
      expect(result).toEqual(expected);
    });

    it('should not add a "0" first byte to r if r first byte has a value greater than 127 and there was some "0" start byte padding', () => {
      // setup
      const rawSignature = Buffer.from('0000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000000000001', 'hex');
      const expected = Buffer.from('3023021effffffffffffffffffffffffffffffffffffffffffffffffffffffffffff020101', 'hex');

      // action
      const result = service['encodeRSToAsn1'](rawSignature);

      // expect
      expect(result).toEqual(expected);
    });

    it('should add a single "0" first byte to s if s first byte has a value greater than 127 and there was no "0" start byte padding', () => {
      // setup
      const rawSignature = Buffer.from('0000000000000000000000000000000000000000000000000000000000000001ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 'hex');
      const expected = Buffer.from('3026020101022100ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 'hex');

      // action
      const result = service['encodeRSToAsn1'](rawSignature);

      // expect
      expect(result).toEqual(expected);
    });

    it('should not add a "0" first byte to s if s first byte has a value greater than 127 and there was some "0" start byte padding', () => {
      // setup
      const rawSignature = Buffer.from('00000000000000000000000000000000000000000000000000000000000000010000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 'hex');
      const expected = Buffer.from('3023020101021effffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 'hex');

      // action
      const result = service['encodeRSToAsn1'](rawSignature);

      // expect
      expect(result).toEqual(expected);
    });

    it('should remove all "0" start padding bytes from s', () => {
      // setup
      const rawSignature = Buffer.from('22222222222222222222222222222222222222222222222222222222222222220000000000000000000000000000000000000000000000000000000000000001', 'hex');
      const expected = Buffer.from('302502202222222222222222222222222222222222222222222222222222222222222222020101', 'hex');

      // action
      const result = service['encodeRSToAsn1'](rawSignature);

      // expect
      expect(result).toEqual(expected);
    });
  });

  describe('length', () => {
    it('should return 00', async () => {
      // setup
      const string = '';
      const expected = '00';

      // action
      const result = service['length'](string);

      // expect
      expect(result).toEqual(expected);
    });

    it('should return 01', async () => {
      // setup
      const string = 'a6';
      const expected = '01';

      // action
      const result = service['length'](string);

      // expect
      expect(result).toEqual(expected);
    });

    it('should return 0f', async () => {
      // setup
      const string = 'a6a6a6a6a6a6a6a6a6a6a6a6a6a6a6';
      const expected = '0f';

      // action
      const result = service['length'](string);

      // expect
      expect(result).toEqual(expected);
    });
    it('should return 10', async () => {
      // setup
      const string = 'a6a6a6a6a6a6a6a6a6a6a6a6a6a6a6a6';
      const expected = '10';

      // action
      const result = service['length'](string);

      // expect
      expect(result).toEqual(expected);
    });
  });
});