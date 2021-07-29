/* istanbul ignore file */

// Declarative code
import { MockServiceProviderConfig } from '@fc/mock-service-provider';
import IdentityProviderAdapterEnvConfig from './identity-provider-adapter-env';
import Redis from './redis';
import Logger from './logger';
import OidcClient from './oidc-client';
import Session from './session';
import App from './app';

export default {
  App,
  Logger,
  Redis,
  OidcClient,
  IdentityProviderAdapterEnvConfig,
  Session,
} as MockServiceProviderConfig;
