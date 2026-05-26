/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
export const up = async (db, client) => {
  await db
    .collection("client")
    .updateMany(
      { scopes: { $ne: "organization_label" } },
      { $addToSet: { scopes: "organization_label" } },
    );
  await db
    .collection("client")
    .updateMany(
      { scopes: { $ne: "roles" } },
      { $addToSet: { scopes: "roles" } },
    );
};

/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
export const down = async (db, client) => {
  await db
    .collection("client")
    .updateMany(
      { scopes: { $in: ["organization_label", "roles"] } },
      { $pull: { scopes: { $in: ["organization_label", "roles"] } } },
    );
};
