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
import HttpProxy from './http-proxy';
import Session from './session';
import OverrideOidcProvider from './override-oidc-provider';
import Mailer from './mailer';

export default {
  /**
   * @TODO #253
   * ETQ Dev, je réfléchis à une manière de gérer des parmètres spécifiques à une app
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/253
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
  HttpProxy,
  Session,
  OverrideOidcProvider,
  Mailer,
} as CoreConfig;
