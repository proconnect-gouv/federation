import { CsmrHttpProxyConfig } from '@fc/csmr-http-proxy';

import App from './app';
import Logger from './logger';
import LoggerLegacy from './logger-legacy';
import HttpProxyBroker from './rie-broker';

export default {
  App,
  Logger,
  LoggerLegacy,
  HttpProxyBroker,
} as CsmrHttpProxyConfig;
