import { CoreFcaConfig } from "@fc/core";
import ApiEntreprise from "./api-entreprise";
import App from "./app";
import EmailValidator from "./email-validator";
import Exceptions from "./exceptions";
import HyyyperbridgeBroker from "./hyyyperbridge-broker";
import IdentityProviderAdapterMongo from "./identity-provider-adapter-mongo";
import Logger from "./logger";
import Mongoose from "./mongoose";
import OidcClient from "./oidc-client";
import OidcProvider from "./oidc-provider";
import Redis from "./redis";
import ServiceProviderAdapterMongo from "./service-provider-adapter-mongo";
import Session from "./session";

export default {
  ApiEntreprise,
  App,
  EmailValidator,
  Exceptions,
  HyyyperbridgeBroker,
  Logger,
  OidcProvider,
  OidcClient,
  Mongoose,
  Redis,
  ServiceProviderAdapterMongo,
  IdentityProviderAdapterMongo,
  Session,
} as CoreFcaConfig;
