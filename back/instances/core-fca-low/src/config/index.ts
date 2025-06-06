import { CoreFcaConfig } from '@fc/core-fca';

import App from './app';
import Core from './core';
import DataProviderAdapterMongo from './data-provider-adapter-mongo';
import EmailValidator from './email-validator';
import Exceptions from './exceptions';
import I18n from './i18n';
import IdentityProviderAdapterMongo from './identity-provider-adapter-mongo';
import Logger from './logger';
import LoggerLegacy from './logger-legacy';
import Mongoose from './mongoose';
import OidcClient from './oidc-client';
import OidcProvider from './oidc-provider';
import OverrideOidcProvider from './override-oidc-provider';
import Redis from './redis';
import ServiceProviderAdapterMongo from './service-provider-adapter-mongo';
import Session from './session';
import Tracking from './tracking';

export default {
  App,
  I18n,
  EmailValidator,
  Exceptions,
  Core,
  Logger,
  LoggerLegacy,
  OidcProvider,
  OidcClient,
  Mongoose,
  Redis,
  ServiceProviderAdapterMongo,
  IdentityProviderAdapterMongo,
  Session,
  Tracking,
  OverrideOidcProvider,
  DataProviderAdapterMongo,
} as CoreFcaConfig;
