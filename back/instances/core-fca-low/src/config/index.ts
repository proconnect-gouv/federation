import { CoreFcaConfig } from '@fc/core-fca';

import App from './app';
import DataProviderAdapterMongo from './data-provider-adapter-mongo';
import EmailValidator from './email-validator';
import Exceptions from './exceptions';
import IdentityProviderAdapterMongo from './identity-provider-adapter-mongo';
import Logger from './logger';
import LoggerLegacy from './logger-legacy';
import Mongoose from './mongoose';
import OidcClient from './oidc-client';
import OidcProvider from './oidc-provider';
import Redis from './redis';
import ServiceProviderAdapterMongo from './service-provider-adapter-mongo';
import Session from './session';
import Tracking from './tracking';

export default {
  App,
  EmailValidator,
  Exceptions,
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
  DataProviderAdapterMongo,
} as CoreFcaConfig;
