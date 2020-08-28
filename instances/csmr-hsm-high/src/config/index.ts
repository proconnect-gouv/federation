/* istanbul ignore file */

// Tested by DTO
import { CsmrHsmConfig } from '@fc/csmr-hsm';
import Logger from './logger';
import CryptographyBroker from './cryptography-broker';
import Hsm from './hsm';

export default {
  Logger,
  Hsm,
  CryptographyBroker,
} as CsmrHsmConfig;
