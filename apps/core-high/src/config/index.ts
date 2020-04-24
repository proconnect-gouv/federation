import { CoreFcpConfig } from '@fc/core-fcp';
import App from './app';
import Logger from './logger';
import OidcProvider from './oidc-provider';
import OidcClient from './oidc-client';
import Mongoose from './mongoose';
import Redis from './redis';
import Rnipp from './rnipp';
import CryptographyBroker from './cryptography-broker';
import Identity from './identity';

export default {
  App,
  Logger,
  OidcProvider,
  OidcClient,
  Mongoose,
  Redis,
  Rnipp,
  Identity,
  CryptographyBroker,
} as CoreFcpConfig;
