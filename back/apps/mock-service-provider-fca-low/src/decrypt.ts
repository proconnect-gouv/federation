// exportable version of fc-exploitation/src/utils/secret-manager.service.ts
import { createDecipheriv } from 'crypto';

const NONCE_LENGTH = 12;
const AUTHTAG_LENGTH = 16;
const CIPHER_HEAD_LENGTH = NONCE_LENGTH + AUTHTAG_LENGTH;

export const decrypt = (cipher: string, cipherPass: string): any => {
  const cipherBuffer = Buffer.from(cipher, 'base64');

  if (Buffer.byteLength(cipherBuffer) <= CIPHER_HEAD_LENGTH) {
    throw new Error('Authentication failed !');
  }

  const nonce = cipherBuffer.slice(0, 12);
  const tag = cipherBuffer.slice(12, 28);
  const ciphertext = cipherBuffer.slice(28);

  const decipher = createDecipheriv('aes-256-gcm', cipherPass, nonce, {
    authTagLength: AUTHTAG_LENGTH,
  });

  decipher.setAuthTag(tag);

  const receivedPlaintext = decipher.update(ciphertext, null, 'utf8');

  try {
    decipher.final();
  } catch (err) {
    throw new Error('Authentication failed !');
  }

  return receivedPlaintext;
};
