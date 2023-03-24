db = db.getSiblingDB('core-legacy');

const collections = ['client', 'partner'];

collections.forEach((collection) => {
  print(`Reseting ${collection} collection...`);
  db[collection].remove({});
  db[collection].dropIndex({});
});
print('All collections reseted!');
