import { CoreFcpConfig } from '@fc/core-fcp';
import App from './app';
import Logger from './logger';
import OidcProvider from './oidc-provider';
import OidcClient from './oidc-client';
import Mongoose from './mongoose';
import Redis from './redis';
import Rnipp from './rnipp';
import CryptographyBroker from './cryptography-broker';
import IdentityManagement from './identity-management';

export default {
  App,
  Logger,
  OidcProvider,
  OidcClient,
  Mongoose,
  Redis,
  Rnipp,
  IdentityManagement,
  CryptographyBroker,
} as CoreFcpConfig;
