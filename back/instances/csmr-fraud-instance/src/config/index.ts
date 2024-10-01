/* istanbul ignore file */

// Tested by DTO
import { CsmrFraudConfig } from '@fc/csmr-fraud';

import App from './app';
import FraudBroker from './fraud-broker';
import Logger from './logger';

export default {
  App,
  Logger,
  FraudBroker,
} as CsmrFraudConfig;
