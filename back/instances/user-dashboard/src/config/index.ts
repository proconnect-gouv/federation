/* istanbul ignore file */

// Declarative code
import { UserDashboardConfig } from '@fc/user-dashboard';

import App from './app';
import Exceptions from './exceptions';
import FraudBroker from './fraud-broker';
import I18n from './i18n';
import IdentityProviderAdapterEnv from './identity-provider-adapter-env';
import Logger from './logger';
import LoggerLegacy from './logger-legacy';
import Mailer from './mailer';
import OidcAcr from './oidc-acr';
import OidcClient from './oidc-client';
import Redis from './redis';
import Session from './session';
import Tracking from './tracking';
import TracksBroker from './tracks-broker';
import UserPreferencesBroker from './user-preferences-broker';

export default {
  App,
  Exceptions,
  IdentityProviderAdapterEnv,
  Logger,
  LoggerLegacy,
  OidcAcr,
  OidcClient,
  Redis,
  Session,
  TracksBroker,
  UserPreferencesBroker,
  Mailer,
  Tracking,
  I18n,
  FraudBroker,
} as UserDashboardConfig;
