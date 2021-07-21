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
import CryptographyFcp from './cryptography-fcp';
import CryptographyEidas from './cryptography-eidas';
import Session from './session';
import OverrideOidcProvider from './override-oidc-provider';
import Mailer from './mailer';
import ServiceProviderAdapterMongoConfig from './service-provider-adapter-mongo';
import IdentityProviderAdapterMongoConfig from './identity-provider-adapter-mongo';

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
  Rnipp,
  CryptographyFcp,
  CryptographyEidas,
  Session,
  OverrideOidcProvider,
  Mailer,
  ServiceProviderAdapterMongoConfig,
  IdentityProviderAdapterMongoConfig,
} as CoreFcpConfig;
