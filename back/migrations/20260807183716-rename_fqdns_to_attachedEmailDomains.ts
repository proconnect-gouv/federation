import type { Db } from "mongodb";

export const up = async (db: Db) => {
  const collection = db.collection("provider");
  const identityProviders = await collection
    .find({ fqdns: { $exists: true } })
    .toArray();
  console.log(
    `Found ${identityProviders.length} identity providers with fqdns field.`,
  );
  for (const identityProvider of identityProviders) {
    const fqdns = identityProvider.fqdns;
    await collection.updateOne(
      { _id: identityProvider._id },
      { $set: { attachedEmailDomains: fqdns } },
    );
  }
};

export const down = async (db: Db) => {
  await db
    .collection("provider")
    .updateMany(
      { attachedEmailDomains: { $exists: true } },
      { $unset: { attachedEmailDomains: "" } },
    );
};
