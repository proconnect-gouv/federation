import { ConfigParser } from "@fc/config";
import { MongooseConfig } from "@fc/mongoose";

const env = new ConfigParser(process.env, "Mongoose");

const mongooseConfig: MongooseConfig = {
  user: env.string("USER"),
  password: env.string("PASSWORD"),
  hosts: env.string("HOSTS"),
  database: env.string("DATABASE"),
  options: {
    authSource: env.string("DATABASE"),
    tls: env.boolean("TLS", true),
    tlsAllowInvalidCertificates: env.boolean("TLS_INSECURE", true),
    tlsCAFile: env.string("TLS_CA_FILE", true),
    tlsAllowInvalidHostnames: env.boolean("TLS_ALLOW_INVALID_HOST_NAME", true),
  },
  watcherDebounceWaitDuration:
    env.number("WATCHER_DEBOUNCE_WAIT_DURATION", true) ?? 1_000,
};

export default mongooseConfig;
