import { CoreFcpConfig } from '@fc/core-fcp';
import App from './app';
import Logger from './logger';
import OidcProvider from './oidc-provider';
import OidcClient from './oidc-client';
import Mongoose from './mongoose';

export default {
  App,
  Logger,
  OidcProvider,
  OidcClient,
  Mongoose,
} as CoreFcpConfig;
