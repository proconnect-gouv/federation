import type { Db } from "mongodb";

export const up = async (db: Db) => {
  await db.collection("provider").updateMany({}, { $unset: { statusURL: "" } });
};

export const down = async (db: Db) => {};
