import { ConfigParser } from "#libs/config";
import { IpGeolocationConfig } from "#libs/ip-geolocation";

const env = new ConfigParser(process.env, "IpGeolocation");

const ipGeolocationConfig: IpGeolocationConfig = {
  baseUrl: env.string("BASE_URL"),
  accountId: env.string("ACCOUNT_ID"),
  licenseKey: env.string("LICENSE_KEY"),
  shouldMockApi: env.boolean("SHOULD_MOCK_API") || false,
  timeoutInMs: 5 * 1000, // 5 seconds in ms
};

export default ipGeolocationConfig;
