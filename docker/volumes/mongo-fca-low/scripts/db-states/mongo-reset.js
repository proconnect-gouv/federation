db = db.getSiblingDB("core-fca-low");

const collections = db.getCollectionNames();

collections.forEach((collection) => {
  print(`Resetting ${collection} collection...`);
  db[collection].deleteMany({});
  db[collection].dropIndexes();
});
print("All collections reset!");
