import type { Db } from "mongodb";

export const up = async (db: Db) => {
  await db
    .collection("provider")
    .updateMany(
      { post_logout_redirect_uris: { $exists: true } },
      { $unset: { post_logout_redirect_uris: "" } },
    );
};

export const down = async (db: Db) => {};
