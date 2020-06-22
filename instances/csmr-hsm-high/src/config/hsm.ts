/* istanbul ignore file */

// Tested by DTO
import { HsmConfig } from '@fc/hsm';

export default {
  libhsm: process.env.HSM_LIB,
  pin: process.env.HSM_PIN,
  virtualHsmSlot: parseInt(process.env.HSM_VIRTUAL_HSM_SLOT, 10),
  sigKeyCkaLabel: process.env.HSM_SIG_HSM_PUB_KEY_CKA_LABEL,
} as HsmConfig;
