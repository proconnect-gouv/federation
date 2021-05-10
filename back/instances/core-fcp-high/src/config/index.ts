/* istanbul ignore file */

// Tested by DTO
import { CoreFcpHighConfig } from '../dto';
import App from './app';
import Logger from './logger';
import OidcProvider from './oidc-provider';
import OidcClient from './oidc-client';
import Mongoose from './mongoose';
import Redis from './redis';
import Rnipp from './rnipp';
import CryptographyBroker from './cryptography-broker';
import CryptographyFcp from './cryptography-fcp';
import CryptographyEidas from './cryptography-eidas';
import SessionGeneric from './session-generic';
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
  CryptographyBroker,
  CryptographyFcp,
  CryptographyEidas,
  SessionGeneric,
  OverrideOidcProvider,
  Mailer,
  ServiceProviderAdapterMongoConfig,
  IdentityProviderAdapterMongoConfig,
} as CoreFcpHighConfig;
