/* istanbul ignore file */

// Tested by DTO
import CryptographyBroker from './cryptography-broker';

import { CsmrHsmConfig } from '@fc/csmr-hsm';

import Hsm from './hsm';
import Logger from './logger';

export default {
  Logger,
  Hsm,
  CryptographyBroker,
} as CsmrHsmConfig;
