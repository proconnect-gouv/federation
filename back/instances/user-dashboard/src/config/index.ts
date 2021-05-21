/* istanbul ignore file */

// Declarative code
import { UserDashboardConfig } from '@fc/user-dashboard';
import IdentityProviderAdapterEnvConfig from './identity-provider-adapter-env';
import Redis from './redis';
import Logger from './logger';
import OidcClient from './oidc-client';
import SessionGeneric from './session-generic';
import App from './app';

export default {
  App,
  Logger,
  Redis,
  OidcClient,
  SessionGeneric,
  IdentityProviderAdapterEnvConfig,
} as UserDashboardConfig;
