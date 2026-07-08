import type { Db } from "mongodb";

export const up = async (db: Db) => {
  await db
    .collection("provider")
    .updateMany({}, { $set: { isMfaCompliant: false } });

  await db
    .collection("client")
    .updateMany({}, { $unset: { isMfaCompliant: "" } });
};

export const down = async (db: Db) => {
  await db
    .collection("provider")
    .updateMany({}, { $unset: { isMfaCompliant: "" } });
};
