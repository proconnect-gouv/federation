import type { Db } from "mongodb";
export const up = async (db: Db) => {
  const collection = db.collection("emailVerificationToken");
  const emailVerificationTokens = await collection
    .find({})
    .sort({ sentAt: -1 })
    .toArray();
  const emailToTokenMap = new Map();

  for (const emailVerificationToken of emailVerificationTokens) {
    if (!emailToTokenMap.has(emailVerificationToken.email)) {
      emailToTokenMap.set(emailVerificationToken.email, true);
    } else {
      await collection.deleteOne({ _id: emailVerificationToken._id });
    }
  }

  await collection.createIndex(
    { email: 1 },
    { unique: true, name: "unique_email" },
  );
};

export const down = async (db: Db) => {
  await db.collection("emailVerificationToken").dropIndex("unique_email");
};
