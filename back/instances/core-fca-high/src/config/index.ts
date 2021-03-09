/* istanbul ignore file */

// Tested by DTO
import { CoreFcaConfig } from '@fc/core-fca';
import App from './app';
import Logger from './logger';
import OidcProvider from './oidc-provider';
import OidcClient from './oidc-client';
import Mongoose from './mongoose';
import Redis from './redis';
import CryptographyBroker from './cryptography-broker';
import CryptographyFca from './cryptography-fca';
import Session from './session';
import ServiceProvider from './service-provider';
import IdentityProvider from './identity-provider';
import OverrideOidcProvider from './override-oidc-provider';

export default {
  /**
   * @TODO #253 ETQ Dev, je réfléchis à une manière de gérer des parmètres spécifiques à une app
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
  CryptographyBroker,
  CryptographyFca,
  Session,
  ServiceProvider,
  IdentityProvider,
  OverrideOidcProvider,
} as CoreFcaConfig;
