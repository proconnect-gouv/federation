import type { Db } from "mongodb";

export const up = async (db: Db) => {
  await db
    .collection("provider")
    .updateMany(
      { token_endpoint_auth_method: { $exists: true } },
      { $unset: { token_endpoint_auth_method: "" } },
    );
};

export const down = async (db: Db) => {};
