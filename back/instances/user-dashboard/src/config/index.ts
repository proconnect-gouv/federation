/* istanbul ignore file */

// Declarative code
import { MockIdentityProviderConfig } from '@fc/mock-identity-provider';
import IdentityProviderAdapterEnv from './identity-provider-adapter-env';
import Redis from './redis';
import Logger from './logger';
import OidcClient from './oidc-client';
import Session from './session';
import Cryptography from './cryptography';
import App from './app';

export default {
  App,
  Logger,
  Redis,
  OidcClient,
  Session,
  Cryptography,
  IdentityProviderAdapterEnv,
} as unknown as MockIdentityProviderConfig;
