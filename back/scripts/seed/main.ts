//

import { MongoClient } from "mongodb";

import { accountsFca } from "./data/account-fca.ts";
import { identityProviders } from "./data/identity-providers.ts";
import { resourceServers } from "./data/resource-servers.ts";
import { serviceProviders } from "./data/service-providers.ts";

//

const {
  Mongoose_DATABASE,
  Mongoose_HOSTS,
  Mongoose_PASSWORD,
  Mongoose_TLS_ALLOW_INVALID_HOST_NAME,
  Mongoose_TLS_CA_FILE,
  Mongoose_TLS_INSECURE,
  Mongoose_TLS,
  Mongoose_USER,
} = process.env;

//

async function main() {
  const client = new MongoClient(
    `mongodb://${Mongoose_USER}:${Mongoose_PASSWORD}@${Mongoose_HOSTS}`,
    {
      authSource: Mongoose_DATABASE,
      tls: Mongoose_TLS === "true",
      tlsAllowInvalidCertificates: Mongoose_TLS_INSECURE === "true",
      tlsCAFile: Mongoose_TLS_CA_FILE || undefined,
      tlsAllowInvalidHostnames: Mongoose_TLS_ALLOW_INVALID_HOST_NAME === "true",
    },
  );

  await client.connect();
  const db = client.db(Mongoose_DATABASE);

  console.log("Initializing Service Providers...");
  for (const serviceProvider of Object.values(serviceProviders)) {
    await db
      .collection("client")
      .replaceOne({ name: serviceProvider.name }, serviceProvider, {
        upsert: true,
      });
  }

  console.log("Initializing Resource Servers...");
  for (const resourceServer of Object.values(resourceServers)) {
    await db
      .collection("client")
      .replaceOne({ name: resourceServer.name }, resourceServer, {
        upsert: true,
      });
  }

  console.log("Initializing Identity Providers...");
  for (const identityProvider of Object.values(identityProviders)) {
    await db
      .collection("provider")
      .replaceOne({ name: identityProvider.name }, identityProvider, {
        upsert: true,
      });
  }

  console.log("Initializing FCA accounts...");
  for (const account of Object.values(accountsFca)) {
    await db
      .collection("accountFca")
      .replaceOne({ _id: account._id }, account, { upsert: true });
  }

  await client.close();
  console.log("Seed complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
