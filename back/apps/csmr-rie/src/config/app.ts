import { AppRmqConfig } from "@fc/app";
import { ConfigParser } from "@fc/config";

const env = new ConfigParser(process.env, "APP");
const appRmqConfig: AppRmqConfig = {
  name: env.string("NAME"),
};

export default appRmqConfig;
