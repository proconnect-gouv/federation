import type { Db } from "mongodb";

export const up = async (db: Db) => {
  await db
    .collection("provider")
    .updateMany(
      { trustedIdentity: { $exists: true } },
      { $unset: { trustedIdentity: "" } },
    );
};

export const down = async (db: Db) => {};
