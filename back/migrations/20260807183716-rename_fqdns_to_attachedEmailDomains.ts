import type { Db } from "mongodb";

export const up = async (db: Db) => {
  await db
    .collection("provider")
    .updateMany({ fqdns: { $exists: true } }, [
      { $set: { attachedEmailDomains: "$fqdns" } },
    ]);
};

export const down = async (db: Db) => {
  await db
    .collection("provider")
    .updateMany(
      { attachedEmailDomains: { $exists: true } },
      { $unset: { attachedEmailDomains: "" } },
    );
};
