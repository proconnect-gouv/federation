import { ConfigParser } from "@fc/config";
import { ServiceProviderAdapterMongoConfig } from "@fc/service-provider-adapter-mongo";

const env = new ConfigParser(process.env, "AdapterMongo");

const serviceProviderAdapterMongoConfig: ServiceProviderAdapterMongoConfig = {
  clientSecretEncryptKey: env.string("CLIENT_SECRET_CIPHER_PASS"),
};

export default serviceProviderAdapterMongoConfig;
