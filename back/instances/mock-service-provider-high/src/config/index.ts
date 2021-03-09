/* istanbul ignore file */

// Declarative code
import { MockServiceProviderConfig } from '@fc/mock-service-provider';
import IdentityProviderEnv from './identity-provider-env';
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
  Session,
  IdentityProviderEnv,
} as MockServiceProviderConfig;
