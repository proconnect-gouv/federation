import { createHash } from 'crypto';
import { Injectable } from '@nestjs/common';
import * as pkcs11js from 'pkcs11js';
import { SignatureDigest } from './enums';

// Temporary configuration here, remove when configuration module operational
const config = {
  pin: 'admin', // process.env.HSM_PIN,
  libhsm:
    '../tw_proteccio/pkcs11_api/nethsm/client/sharedlib64/libnethsm.so',
}

/**
 *  Support EC key prime field up to 521 bits
 *  @see https://en.wikipedia.org/wiki/Elliptic-curve_cryptography
 *  /!\ Do not modify without understanding the basics of the upper link /!\
 */
const MAX_SIG_OUTPUT_SIZE = 132;

/**
 * For documentation  
 */
@Injectable()
export class CryptographyGatewayHighService {
  private pkcs11Instance: pkcs11js.PKCS11;
  private pkcs11Session: Buffer;

  /** @todo The injection will be done later */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(/* Inject config here */) {}

  onModuleInit() {
    this.pkcs11Instance = this.instanciatePkcs11js(config.libhsm);
    this.pkcs11Session = this.openSessionWithTheHsm();
    this.authenticateWithTheHsm();
  }

  onModuleDestroy() {
    this.closeCurrentSessionWithTheHsm();
  }

  /**
   * Sign data using the HSM and a private EC key
   * @param privateKeyLabel the private key label
   * @param data data to sign as a Buffer
   * @param digest alg used to digest data before signing (default to sha256).
   * @returns signed data
   */
  async sign(
    privateKeyLabel: string,
    data: Buffer,
    digest: SignatureDigest = SignatureDigest.SHA256
  ): Promise<Buffer> {
    /** The hash is not computed by the HSM (would be too slow) */
    const hash = createHash(digest);
    
    hash.update(data);

    const dataDigest = hash.digest();

    /**
     * We use the HSM to sign our digest as specified in
     * @see https://www.cryptsoft.com/pkcs11doc/v211/group__SEC__12__4__2__ECDSA__WITHOUT__HASHING.html
     */
    const key = this.getPrivateKeySlotByLabel(privateKeyLabel);

    this.pkcs11Instance.C_SignInit(
      this.pkcs11Session,
      { mechanism: pkcs11js.CKM_ECDSA },
      key,
    );

    const signature = this.pkcs11Instance.C_Sign(
      this.pkcs11Session,
      dataDigest,
      Buffer.alloc(MAX_SIG_OUTPUT_SIZE),
    );

    if (!(signature instanceof Buffer) || signature.length === 0) {
      throw new Error('E_SIG_NOT_FOUND');
    }

    /**
     * As "signature" here contain a raw formatted EC signature (two positive numbers "r" and "s" concatened)
     * for performances reasons, we need to encode it to a format that crypto (and so openssl) understand.
    */
    return this.encodeRSToAsn1(signature);
  }

  /**
   * Decrypt data using crypto and a private key
   * @param privateKeyLabel the private key label
   * @param cipher a cipher
   * @returns decrypted data
   */
  async privateDecrypt(privateKey: string, cipher: Buffer): Promise<Buffer> {
    const key = this.getPrivateKeySlotByLabel(privateKey);

    this.pkcs11Instance.C_DecryptInit(
      this.pkcs11Session,
      {
        mechanism: pkcs11js.CKM_RSA_PKCS_OAEP,
      },
      key,
    );

    return this.pkcs11Instance.C_Decrypt(
      this.pkcs11Session,
      cipher,
      Buffer.alloc(cipher.byteLength),
    );
  }

  /**
   * Instanciate the library pkcs11js
   * @param libPath the path of the shared .so library
   * @returns 
   */
  private instanciatePkcs11js(libPath: string): pkcs11js.PKCS11 {
    const pkcs11Instance = new pkcs11js.PKCS11();

    pkcs11Instance.load(libPath);

    pkcs11Instance.C_Initialize();

    return pkcs11Instance;
  }

  /**
   * Open an anonym session with the HSM (give access to public objects in the HSM)
   */
  private openSessionWithTheHsm(): Buffer {
    const [ firstSlot ] = this.pkcs11Instance.C_GetSlotList(true);

    return this.pkcs11Instance.C_OpenSession(
      firstSlot,
      pkcs11js.CKF_SERIAL_SESSION,
    );
  }

  /**
   * Close the session with the HSM, 
   */
  private closeCurrentSessionWithTheHsm(): void {
    this.pkcs11Instance.C_Finalize();
  }

  /**
   * Authenticated the current session (give access to private objects in the HSM)
   */
  private authenticateWithTheHsm(): void {
    this.pkcs11Instance.C_Login(this.pkcs11Session, pkcs11js.CKU_USER, config.pin);
  }

  /**
   * Get a key slot in the HSM given a label
   * /!\ Be careful not to have more than one key with the same label in the HSM /!\
   * @param ckaLabel the label
   * @returns The slot of the FIRST key that match the given label.
   */
  private getPrivateKeySlotByLabel(ckaLabel): Buffer {
    this.pkcs11Instance.C_FindObjectsInit(this.pkcs11Session, [
      { type: pkcs11js.CKA_KEY_TYPE, value: pkcs11js.CKO_PRIVATE_KEY },
      { type: pkcs11js.CKA_LABEL, value: Buffer.from(ckaLabel, 'utf8') },
    ]);

    let hObject: Buffer;

    try {
      hObject = this.pkcs11Instance.C_FindObjects(this.pkcs11Session);
    } catch (e) {
      throw e;
    } finally {
      this.pkcs11Instance.C_FindObjectsFinal(this.pkcs11Session);
    }

    return hObject;
  }

  /**
   * Extract r and s from rawSignature and encode it to ASN.1 format 
   * @param rawSignature The (r, s) pair concatened
   * @returns The der ASN.1 encoded signature
   * @see https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm#Signature_generation_algorithm
   */
  private encodeRSToAsn1(rawSignature: Buffer): Buffer {
    const signHex = rawSignature.toString('hex');
    const nSize = signHex.length /  2;

    let r = signHex.substring(0, nSize);
    let s = signHex.substring(nSize);

    const rPre = !r.startsWith('00');
    /** Remove "0" start padding bytes for r */
    r = r.replace(/^(?:00)+/, '');

    const rFirstByte = parseInt(r.substring(0, 2), 16);
    /**
     * if no padding found and first byte is above the upper limit of a signed char,
     * add a single "0" padding byte
     */
    if (rPre && rFirstByte > 127) {
      r = `00${r}`;
    }

    const sPre = !s.startsWith('00');
    /** Remove "0" start padding bytes for s */
    s = s.replace(/^(?:00)+/, '');

    const sFirstByte = parseInt(s.substring(0, 2), 16);
    /**
     * if no padding found and first byte is above the upper limit of a signed char,
     * add a single "0" padding byte
     */
    if (sPre && sFirstByte > 127) {
      s = `00${s}`;
    }

    const payload = `02${this.length(r)}${r}02${this.length(s)}${s}`;

    const der = `30${this.length(payload)}${payload}`;
    
    return Buffer.from(der, 'hex');
  }

  /**
   * Get the number of bytes that the given hex string takes
   * @param hex The input string hex formatted
   * @returns the byteLength as an hexadecimal string
   */
  private length(hex: string) {
    return `00${(hex.length / 2).toString(16)}`.slice(-2);
  }
}
