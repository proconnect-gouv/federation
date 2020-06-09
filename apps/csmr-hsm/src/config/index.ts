/* istanbul ignore file */

// Tested by DTO
import { CsmrHsmConfig } from '../dto';
import Logger from './logger';
import CryptographyBroker from './cryptograpy-broker';
import Hsm from './hsm';

export default {
  Logger,
  Hsm,
  CryptographyBroker,
} as CsmrHsmConfig;
