import type { Db } from "mongodb";

export const up = async (db: Db) => {
  await db
    .collection("client")
    .updateMany({ email: { $exists: true } }, { $unset: { email: "" } });
};

export const down = async (db: Db) => {};
