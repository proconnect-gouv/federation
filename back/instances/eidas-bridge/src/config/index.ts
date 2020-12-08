/* istanbul ignore file */

// Tested by DTO
import { EidasBridgeConfig } from '@fc/eidas-bridge';
import App from './app';
import Cryptography from './cryptography';
import CryptographyBroker from './cryptography-broker';
import IdentityProviderEnv from './identity-provider-env';
import ServiceProviderEnv from './service-provider-env';
import Logger from './logger';
import OidcClient from './oidc-client';
import OidcProvider from './oidc-provider';
import OverrideOidcProvider from './override-oidc-provider';
import Redis from './redis';
import Session from './session';
import SessionGeneric from './session-generic';
import EidasClient from './eidas-client';
import EidasProvider from './eidas-provider';
import ApacheIgnite from './apache-ignite';
import EidasLightProtocol from './eidas-light-protocol';
import countryList from './country-list';

export default {
  /**
   * @TODO #253
   * ETQ Dev, je réfléchis à une manière de gérer des parmètres spécifiques à une app
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/253
   */
  Core: {
    defaultRedirectUri: 'https://franceconnect.gouv.fr',
    countryList: countryList
  },
  App,
  Cryptography,
  CryptographyBroker,
  IdentityProviderEnv,
  ServiceProviderEnv,
  Logger,
  OidcClient,
  OidcProvider,
  OverrideOidcProvider,
  Redis,
  Session,
  SessionGeneric,
  EidasClient,
  EidasProvider,
  ApacheIgnite,
  EidasLightProtocol,
} as EidasBridgeConfig;
