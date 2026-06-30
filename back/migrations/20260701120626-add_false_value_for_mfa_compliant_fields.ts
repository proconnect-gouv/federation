/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
export const up = async (db) => {
  await db
    .collection("provider")
    .updateMany(
      { isMfaCompliant: { $exists: false } },
      { $set: { isMfaCompliant: false, mfaComplianceNote: "" } },
    );
};

/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
export const down = async (db) => {
  await db
    .collection("provider")
    .updateMany(
      { isMfaCompliant: { $exists: true } },
      { $unset: { isMfaCompliant: "", mfaComplianceNote: "" } },
    );
};
