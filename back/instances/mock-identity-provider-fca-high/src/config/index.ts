/* istanbul ignore file */

// Declarative code
import { MockIdentityProviderFcaConfig } from '@fc/mock-identity-provider-fca';
import Redis from './redis';
import Logger from './logger';
import Session from './session';
import CryptographyFca from './cryptography-fca';
import OidcProvider from './oidc-provider';
import App from './app';
import ServiceProviderEnv from './service-provider-env';

export default {
  App,
  Logger,
  Redis,
  Session,
  CryptographyFca,
  OidcProvider,
  ServiceProviderEnv,
} as MockIdentityProviderFcaConfig;
