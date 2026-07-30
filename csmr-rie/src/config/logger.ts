import { ConfigParser } from "@fc/config";
import { LoggerConfig } from "@fc/logger";

const env = new ConfigParser(process.env, "Logger");

const loggerConfig: LoggerConfig = {
  threshold: env.string("THRESHOLD"),
};

export default loggerConfig;
