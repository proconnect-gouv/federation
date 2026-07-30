import { CsmrHttpProxyConfig } from "@fc/csmr-http-proxy";
import App from "./app";
import Logger from "./logger";
import HttpProxyBroker from "./rie-broker";

const csmrHttpProxyConfig: CsmrHttpProxyConfig = {
  App,
  Logger,
  HttpProxyBroker,
};

export default csmrHttpProxyConfig;
