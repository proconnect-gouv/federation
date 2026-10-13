import type { Db } from "mongodb";

export const up = async (db: Db) => {
  await db.collection("client").updateMany({}, { $pull: { scopes: "roles" } });
};

export const down = async (db: Db) => {
  await db
    .collection("client")
    .updateMany({}, { $addToSet: { scopes: "roles" } });
};
