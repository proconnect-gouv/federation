import type { Db } from "mongodb";

export const up = async (db: Db) => {
  await db
    .collection("client")
    .updateMany({}, { $set: { isXdaEnabled: false } });
};

export const down = async (db: Db) => {
  await db
    .collection("client")
    .updateMany({}, { $unset: { isXdaEnabled: "" } });
};
