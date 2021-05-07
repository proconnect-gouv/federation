db = db.getSiblingDB("core-fcp-high");

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

print("All collections reseted!");
