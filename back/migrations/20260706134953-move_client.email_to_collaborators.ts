import type { Db } from "mongodb";

export const up = async (db: Db) => {
  const clients = await db
    .collection("client")
    .find({ email: { $exists: true }, collaborators: { $exists: false } })
    .toArray();
  for (const client of clients) {
    const emails = client.email?.split("\n").filter(Boolean) || [];
    if (emails.length === 0) continue;
    await db
      .collection("client")
      .updateOne(
        { _id: client._id },
        { $addToSet: { collaborators: { $each: emails } } },
      );
  }
};

export const down = async (db: Db) => {
  await db.collection("client").updateMany({}, { $set: { collaborators: [] } });
};
