import { ConfigParser } from "@fc/config";
import { IdentityProviderAdapterMongoConfig } from "@fc/identity-provider-adapter-mongo";

const env = new ConfigParser(process.env, "AdapterMongo");

const identityProviderAdapterMongoConfig: IdentityProviderAdapterMongoConfig = {
  clientSecretEncryptKey: env.string("CLIENT_SECRET_CIPHER_PASS"),
  decryptClientSecretFeature: env.boolean("DECRYPT_CLIENT_SECRET_FEATURE"),
};

export default identityProviderAdapterMongoConfig;
