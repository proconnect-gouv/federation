import { ConfigParser } from "#libs/config";
import { LoggerConfig } from "#libs/logger";

const env = new ConfigParser(process.env, "Logger");

const loggerConfig: LoggerConfig = {
  threshold: env.string("THRESHOLD"),
};

export default loggerConfig;
