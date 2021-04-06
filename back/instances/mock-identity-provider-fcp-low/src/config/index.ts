/* istanbul ignore file */

// Declarative code
import { MockIdentityProviderConfig } from '@fc/mock-identity-provider';
import Redis from './redis';
import Logger from './logger';
import SessionGeneric from './session-generic';
import OidcProvider from './oidc-provider';
import App from './app';
import ServiceProviderAdapterEnvConfig from './service-provider-adapter-env';

export default {
  App,
  Logger,
  Redis,
  SessionGeneric,
  OidcProvider,
  ServiceProviderAdapterEnvConfig,
} as MockIdentityProviderConfig;
