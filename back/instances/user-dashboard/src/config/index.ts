/* istanbul ignore file */

// Declarative code
import { UserDashboardConfig } from '@fc/user-dashboard';

import App from './app';
import IdentityProviderAdapterEnvConfig from './identity-provider-adapter-env';
import Logger from './logger';
import OidcClient from './oidc-client';
import Redis from './redis';
import Session from './session';

export default {
  App,
  Logger,
  Redis,
  OidcClient,
  Session,
  IdentityProviderAdapterEnvConfig,
} as UserDashboardConfig;
