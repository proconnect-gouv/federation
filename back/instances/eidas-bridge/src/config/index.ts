import { EidasBridgeConfig } from '@fc/eidas-bridge';

import ApacheIgnite from './apache-ignite';
import App from './app';
import Cog from './cog';
import CryptographyEidas from './cryptography-eidas';
import EidasClient from './eidas-client';
import EidasLightProtocol from './eidas-light-protocol';
import EidasProvider from './eidas-provider';
import Exceptions from './exceptions';
import I18n from './i18n';
import IdentityProviderAdapterEnv from './identity-provider-adapter-env';
import Logger from './logger';
import LoggerLegacy from './logger-legacy';
import OidcAcr from './oidc-acr';
import OidcClient from './oidc-client';
import OidcProvider from './oidc-provider';
import OverrideOidcProvider from './override-oidc-provider';
import Redis from './redis';
import ServiceProviderAdapterEnv from './service-provider-adapter-env';
import Session from './session';
import Tracking from './tracking';

export default {
  /**
   * @TODO #253 ETQ Dev, je réfléchis à une manière de gérer des parmètres spécifiques à une app
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/253
   */
  ApacheIgnite,
  App,
  Cog,
  Core: {
    defaultRedirectUri: 'https://franceconnect.gouv.fr',
  },
  CryptographyEidas,
  EidasClient,
  EidasLightProtocol,
  EidasProvider,
  Exceptions,
  I18n,
  IdentityProviderAdapterEnv,
  Logger,
  LoggerLegacy,
  OidcAcr,
  OidcClient,
  OidcProvider,
  OverrideOidcProvider,
  Redis,
  ServiceProviderAdapterEnv,
  Session,
  Tracking,
} as EidasBridgeConfig;
