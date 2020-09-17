/* istanbul ignore file */

// Tested by DTO
import { CoreFcpConfig } from '@fc/core-fcp';
import App from './app';
import Logger from './logger';
import OidcProvider from './oidc-provider';
import OidcClient from './oidc-client';
import Mongoose from './mongoose';
import Redis from './redis';
import Rnipp from './rnipp';
import CryptographyBroker from './cryptography-broker';
import Cryptography from './cryptography';
import HttpProxy from './http-proxy';
import Session from './session';
import OverrideOidcProvider from './override-oidc-provider';
import Mailer from './mailer';

export default {
  /**
   * @todo think about a better way to handle app specific parameters
   */
  CoreFcp: {
    defaultRedirectUri: 'https://franceconnect.gouv.fr',
  },
  App,
  Logger,
  OidcProvider,
  OidcClient,
  Mongoose,
  Redis,
  Rnipp,
  CryptographyBroker,
  Cryptography,
  HttpProxy,
  Session,
  OverrideOidcProvider,
  Mailer,
} as CoreFcpConfig;
