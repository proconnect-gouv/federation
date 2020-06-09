/* istanbul ignore file */

// Tested by DTO
import { HsmConfig } from '@fc/hsm';

export default {
  libhsm: process.env.HSM_LIB,
  pin: process.env.HSM_PIN,
  sigKeyCkaLabel: process.env.HSM_SIG_HSM_PUB_KEY_CKA_LABEL,
} as HsmConfig;
