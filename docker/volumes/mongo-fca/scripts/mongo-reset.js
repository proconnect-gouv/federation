/**
 * @todo rename `corev2` into `core-fca`
 */
db = db.getSiblingDB("corev2");

print("Reseting account collection...");
db.account.remove({});

print("Reseting user collection...");
db.user.remove({});

print("Reseting client collection");
db.client.remove({});

print("Reseting provider collection");
db.provider.remove({});

print("Reseting scopelabels collection");
db.scopelabels.remove({});

print('Reseting ministries collection...');
db.ministries.remove({});

print("All collections reseted!");
