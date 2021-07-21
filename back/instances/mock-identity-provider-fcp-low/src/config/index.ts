/* istanbul ignore file */

// Declarative code
import { MockIdentityProviderConfig } from '@fc/mock-identity-provider';
import Redis from './redis';
import Logger from './logger';
import Session from './session';
import OidcProvider from './oidc-provider';
import App from './app';
import ServiceProviderAdapterEnvConfig from './service-provider-adapter-env';

export default {
  App,
  Logger,
  Redis,
  Session,
  OidcProvider,
  ServiceProviderAdapterEnvConfig,
} as MockIdentityProviderConfig;
