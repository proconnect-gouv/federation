db = db.getSiblingDB("core-legacy");

print("Reseting account collection...");
db.account.remove({});

print("Reseting user collection...");
db.user.remove({});

print("Reseting client collection");
db.client.remove({});

print("Reseting provider collection");
db.provider.remove({});
db.provider.dropIndexes();

print("Reseting ministry collection...");
db.ministries.remove({});

print("Reseting partner collection");
db.partner.remove({});

print("Reseting scopes collection");
db.scopes.remove({});
db.scopes.dropIndexes();

print("Reseting authorizations collection...");
db.authorizations.remove({});

print("Reseting consent collection");
db.consent.remove({});

print("Reseting Configuration collection");
db.configuration.remove({});

print("Reseting Notification collection");
db.notifications.remove({});

print("All collections reseted!");
