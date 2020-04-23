import { FakeHsmConfig } from '@fc/fake-hsm';

export default {
  keys: JSON.parse(process.env.CRYPTO_SIG_DETECTOR_KEY),
} as FakeHsmConfig;
