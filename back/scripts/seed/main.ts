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
  SEED_ONLY,
} = process.env;

//

function seedOverride(
  key: string,
  field: "CLIENT_ID" | "CLIENT_SECRET" | "ORIGIN" | "UID",
) {
  return process.env[`SEED_${key.replaceAll("-", "_")}_${field}`];
}

function withOrigin(url: string, origin: string | undefined) {
  if (!origin) return url;
  return new URL(origin).origin + url.slice(new URL(url).origin.length);
}

function clientDocument<
  Client extends {
    client_secret: string;
    key: string;
    post_logout_redirect_uris: string[];
    redirect_uris: string[];
  },
>(key: string, client: Client) {
  const origin = seedOverride(key, "ORIGIN");
  return {
    ...client,
    client_secret: seedOverride(key, "CLIENT_SECRET") ?? client.client_secret,
    key: seedOverride(key, "CLIENT_ID") ?? client.key,
    post_logout_redirect_uris: client.post_logout_redirect_uris.map((uri) =>
      withOrigin(uri, origin),
    ),
    redirect_uris: client.redirect_uris.map((uri) => withOrigin(uri, origin)),
  };
}

const onlyKeys = SEED_ONLY?.split(",");
const unknownKeys = (onlyKeys ?? []).filter(
  (key) =>
    !(
      key in identityProviders ||
      key in resourceServers ||
      key in serviceProviders
    ),
);
if (unknownKeys.length > 0) {
  throw new Error(`Unknown SEED_ONLY entries: ${unknownKeys.join(", ")}`);
}
const isSelected = (key: string) => onlyKeys?.includes(key) ?? true;

const serviceProviderDocuments = Object.entries(serviceProviders)
  .filter(([key]) => isSelected(key))
  .map(([key, serviceProvider]) => clientDocument(key, serviceProvider));

const resourceServerDocuments = Object.entries(resourceServers)
  .filter(([key]) => isSelected(key))
  .map(([key, resourceServer]) => clientDocument(key, resourceServer));

const seededUids = Object.fromEntries(
  Object.entries(identityProviders).map(([key, { uid }]) => [
    uid,
    seedOverride(key, "UID") ?? uid,
  ]),
);

const identityProviderDocuments = Object.entries(identityProviders)
  .filter(([key]) => isSelected(key))
  .map(([key, identityProvider]) => {
    const origin = seedOverride(key, "ORIGIN");
    return {
      ...identityProvider,
      clientID: seedOverride(key, "CLIENT_ID") ?? identityProvider.clientID,
      client_secret:
        seedOverride(key, "CLIENT_SECRET") ?? identityProvider.client_secret,
      discoveryUrl: withOrigin(identityProvider.discoveryUrl, origin),
      endSessionURL: withOrigin(identityProvider.endSessionURL, origin),
      uid: seededUids[identityProvider.uid],
      url: withOrigin(identityProvider.url, origin),
    };
  });

const accountDocuments = Object.values(accountsFca).map((account) => ({
  ...account,
  idpIdentityKeys: account.idpIdentityKeys.map((identityKey) => ({
    ...identityKey,
    idpUid: seededUids[identityKey.idpUid] ?? identityKey.idpUid,
  })),
}));

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
