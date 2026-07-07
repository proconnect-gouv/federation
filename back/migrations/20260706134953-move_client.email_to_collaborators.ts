import type { Db } from "mongodb";

export const up = async (db: Db) => {
  const clients = await db.collection("client").find({}).toArray();
  for (const client of clients) {
    let emails: string[] = [];
    try {
      emails = client.email?.split("\n").filter(Boolean) || [];
    } catch (error) {
      console.warn(
        `Error processing client with _id: ${client._id} (email: ${client.email})`,
        error,
      );
    } finally {
      await db
        .collection("client")
        .updateOne({ _id: client._id }, { $set: { collaborators: emails } });
    }
  }
};

export const down = async (db: Db) => {
  await db.collection("client").updateMany({}, { $set: { collaborators: [] } });
};
