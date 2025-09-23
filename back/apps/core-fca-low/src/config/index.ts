import { CoreFcaConfig } from '@fc/core';

import App from './app';
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
} as CoreFcaConfig;
