import { ConfigParser } from "@fc/config";
import { RedisConfig } from "@fc/redis";

const env = new ConfigParser(process.env, "Redis");

const ca = env.file("CACERT", true);
const tlsSettings = ca ? { ca } : undefined;

const sentinels = env.stringArray("SENTINELS").map((entry) => {
  const [host, port] = entry.split(":");
  return { host, port: parseInt(port, 10) };
});

const useSentinels = sentinels.length > 0;

const redisConfig: RedisConfig = {
  host: useSentinels ? undefined : env.string("HOST"),
  port: useSentinels ? undefined : env.number("PORT"),
  password: env.string("PASSWORD"),
  db: env.number("DB"),
  sentinels: useSentinels ? sentinels : undefined,
  name: useSentinels ? env.string("NAME") : undefined,
  sentinelPassword: env.string("SENTINEL_PASSWORD", true),
  sentinelTLS: tlsSettings,
  tls: tlsSettings,
  enableTLSForSentinelMode: env.boolean("ENABLE_TLS_FOR_SENTINEL_MODE"),
};

export default redisConfig;
