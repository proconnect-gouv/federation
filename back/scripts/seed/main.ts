//

import { MongoClient } from "mongodb";

import { accountsFca } from "./data/account-fca.ts";
import { dataProviders } from "./data/dp.ts";
import { identityProviders } from "./data/idp.ts";
import { deskScopes, identityScopes } from "./data/scopes.ts";
import { serviceProviders } from "./data/sp.ts";

//

if (process.env.NODE_ENV === "production") {
  console.error("seed.mongo.ts refuses to run when NODE_ENV=production");
  process.exit(1);
}

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

  console.log("Initializing SPs...");
  for (const sp of Object.values(serviceProviders)) {
    await db
      .collection("client")
      .replaceOne({ name: sp.name }, sp, { upsert: true });
  }

  console.log("Initializing data providers...");
  for (const dp of Object.values(dataProviders)) {
    await db
      .collection("client")
      .replaceOne({ name: dp.name }, dp, { upsert: true });
  }

  console.log("Initializing IDPs...");
  for (const idp of Object.values(identityProviders)) {
    await db
      .collection("provider")
      .replaceOne({ name: idp.name }, idp, { upsert: true });
  }

  console.log("Initializing FCA accounts...");
  for (const account of Object.values(accountsFca)) {
    await db
      .collection("accountFca")
      .replaceOne({ _id: account._id }, account, { upsert: true });
  }

  console.log("Initializing scopes...");
  await db.collection("scopes").createIndex({ scope: 1 }, { unique: true });
  for (const scope of [...identityScopes, ...deskScopes]) {
    await db
      .collection("scopes")
      .replaceOne({ scope: scope.scope }, scope, { upsert: true });
  }

  await client.close();
  console.log("Seed complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
