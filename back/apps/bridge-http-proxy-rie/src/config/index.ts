import { BridgeHttpProxyConfig } from 'apps/bridge-http-proxy-rie/src';

import App from './app';
import Logger from './logger';
import LoggerLegacy from './logger-legacy';
import BridgeProxyBroker from './rie-broker';

export default {
  App,
  Logger,
  LoggerLegacy,
  BridgeProxyBroker,
} as BridgeHttpProxyConfig;
