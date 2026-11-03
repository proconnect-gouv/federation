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

const overrides: unknown = SEED_OVERRIDES
  ? JSON.parse(SEED_OVERRIDES)
  : undefined;

const ownProperty = (value: unknown, key: string): unknown =>
  typeof value === "object" && value !== null
    ? Object.getOwnPropertyDescriptor(value, key)?.value
    : undefined;

const seeds = {
  accountFca: { entries: accountsFca, id: "sub" },
  client: { entries: { ...resourceServers, ...serviceProviders }, id: "key" },
  provider: { entries: identityProviders, id: "uid" },
};

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

  const result = await client.bulkWrite(
    Object.entries(seeds).flatMap(([collection, { entries, id }]) =>
      Object.entries<Record<string, unknown>>(entries).flatMap(
        ([name, entry]) => {
          const override =
            overrides === undefined
              ? {}
              : ownProperty(ownProperty(overrides, collection), name);
          if (typeof override !== "object") return [];
          const replacement = { ...entry, ...override };
          return {
            filter: { [id]: replacement[id] },
            name: "replaceOne",
            namespace: `${Mongoose_DATABASE}.${collection}`,
            replacement,
            upsert: true,
          } as const;
        },
      ),
    ),
  );
  console.log(result);

  await client.close();
  console.log("Seed complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
