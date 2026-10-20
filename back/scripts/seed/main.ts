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
  SEED_OVERRIDES,
} = process.env;

//

const overrides: Record<string, object> | undefined = SEED_OVERRIDES
  ? JSON.parse(SEED_OVERRIDES)
  : undefined;

const seedKeys = Object.keys({
  ...accountsFca,
  ...identityProviders,
  ...resourceServers,
  ...serviceProviders,
});
const unknownKeys = Object.keys(overrides ?? {}).filter(
  (key) => !seedKeys.includes(key),
);
if (unknownKeys.length > 0) {
  throw new Error(`Unknown SEED_OVERRIDES entries: ${unknownKeys.join(", ")}`);
}

const seeded = <Entry extends object>(entries: Record<string, Entry>) =>
  Object.entries(entries)
    .filter(([key]) => !overrides || key in overrides)
    .map(([key, entry]) => ({ ...entry, ...overrides?.[key] }));

const serviceProviderDocuments = seeded(serviceProviders);
const resourceServerDocuments = seeded(resourceServers);
const identityProviderDocuments = seeded(identityProviders);
const accountDocuments = seeded(accountsFca);

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

  await db.collection("client").createIndex({ key: 1 }, { unique: true });
  await db.collection("provider").createIndex({ uid: 1 }, { unique: true });
  await db.collection("accountFca").createIndex({ sub: 1 }, { unique: true });

  console.log("Initializing Service Providers...");
  for (const serviceProvider of serviceProviderDocuments) {
    await db
      .collection("client")
      .replaceOne({ key: serviceProvider.key }, serviceProvider, {
        upsert: true,
      });
  }

  console.log("Initializing Resource Servers...");
  for (const resourceServer of resourceServerDocuments) {
    await db
      .collection("client")
      .replaceOne({ key: resourceServer.key }, resourceServer, {
        upsert: true,
      });
  }

  console.log("Initializing Identity Providers...");
  for (const identityProvider of identityProviderDocuments) {
    await db
      .collection("provider")
      .replaceOne({ uid: identityProvider.uid }, identityProvider, {
        upsert: true,
      });
  }

  console.log("Initializing FCA accounts...");
  for (const account of accountDocuments) {
    await db
      .collection("accountFca")
      .replaceOne({ sub: account.sub }, account, { upsert: true });
  }

  await client.close();
  console.log("Seed complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
