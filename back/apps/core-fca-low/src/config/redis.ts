import { ConfigParser } from "@fc/config";
import { RedisConfig } from "@fc/redis";

const env = new ConfigParser(process.env, "Redis");

const ca = env.file("CACERT", true);
const tlsSettings = ca ? { ca } : undefined;

export default {
  host: env.string("HOST"),
  port: env.number("PORT"),
  password: env.string("PASSWORD"),
  db: env.number("DB"),
  tls: tlsSettings,
  sentinelTLS: tlsSettings,
  enableTLSForSentinelMode: env.boolean("ENABLE_TLS_FOR_SENTINEL_MODE"),
} as RedisConfig;
