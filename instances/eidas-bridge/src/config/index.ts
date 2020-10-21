/* istanbul ignore file */

// Tested by DTO
import { EidasBridgeConfig } from '@fc/eidas-bridge';
import App from './app';
import Cryptography from './cryptography';
import IdentityProviderEnv from './identity-provider-env';
import Logger from './logger';
import OidcClient from './oidc-client';
import Redis from './redis';
import Session from './session';

export default {
  /**
   * @TODO #253
   * ETQ Dev, je réfléchis à une manière de gérer des parmètres spécifiques à une app
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/253
   */
  Core: {
    defaultRedirectUri: 'https://franceconnect.gouv.fr',
  },
  App,
  Cryptography,
  IdentityProviderEnv,
  Logger,
  OidcClient,
  Redis,
  Session
} as EidasBridgeConfig;
