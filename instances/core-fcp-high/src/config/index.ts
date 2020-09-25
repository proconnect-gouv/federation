/* istanbul ignore file */

// Tested by DTO
import { CoreConfig } from '@fc/core';
import App from './app';
import Logger from './logger';
import OidcProvider from './oidc-provider';
import OidcClient from './oidc-client';
import Mongoose from './mongoose';
import Redis from './redis';
import Rnipp from './rnipp';
import CryptographyBroker from './cryptography-broker';
import Cryptography from './cryptography';
import Session from './session';
import OverrideOidcProvider from './override-oidc-provider';
import Mailer from './mailer';

export default {
  /**
   * @todo think about a better way to handle app specific parameters
   */
  Core: {
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
  Session,
  OverrideOidcProvider,
  Mailer,
} as CoreConfig;
