import { ConfigParser } from "@fc/config";
import { HttpProxyBrokerConfig } from "@fc/csmr-http-proxy";

const env = new ConfigParser(process.env, "RieBroker");

export default {
  urls: env.json("URLS"),
  queue: env.string("QUEUE"),
  queueOptions: {
    durable: true,
  },
  payloadEncoding: "base64",

  // Global request timeout used for any outgoing app requests.
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT, 10),
  proxyDisabled: env.boolean("PROXY_DISABLED"),
} as HttpProxyBrokerConfig;
