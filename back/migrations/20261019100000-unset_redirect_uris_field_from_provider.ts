import type { Db } from "mongodb";

export const up = async (db: Db) => {
  await db
    .collection("provider")
    .updateMany(
      { redirect_uris: { $exists: true } },
      { $unset: { redirect_uris: "" } },
    );
};

export const down = async (db: Db) => {};
