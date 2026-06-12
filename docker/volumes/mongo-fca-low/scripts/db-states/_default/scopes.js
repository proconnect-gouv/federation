// -- Scopes - set all scopes by types with a description label
print("Add scopes...");
db.scopes.createIndex({ scope: 1 }, { unique: true });

// -- Scopes - IDENTITY
print("Initializing IDENTITY scopes...");
db.scopes.replaceOne(
  { scope: "openid" },
  { scope: "openid", fd: "IDENTITY", label: "", __v: 0 },
  { upsert: true },
);
db.scopes.replaceOne(
  { scope: "given_name" },
  { scope: "given_name", fd: "IDENTITY", label: "Prénom(s)", __v: 0 },
  { upsert: true },
);
db.scopes.replaceOne(
  { scope: "usual_name" },
  { scope: "usual_name", fd: "IDENTITY", label: "", __v: 0 },
  { upsert: true },
);
db.scopes.replaceOne(
  { scope: "email" },
  { scope: "email", fd: "IDENTITY", label: "", __v: 0 },
  { upsert: true },
);
db.scopes.replaceOne(
  { scope: "uid" },
  { scope: "uid", fd: "IDENTITY", label: "", __v: 0 },
  { upsert: true },
);
db.scopes.replaceOne(
  { scope: "siren" },
  { scope: "siren", fd: "IDENTITY", label: "", __v: 0 },
  { upsert: true },
);
db.scopes.replaceOne(
  { scope: "siret" },
  { scope: "siret", fd: "IDENTITY", label: "", __v: 0 },
  { upsert: true },
);
db.scopes.replaceOne(
  { scope: "organizational_unit" },
  { scope: "organizational_unit", fd: "IDENTITY", label: "", __v: 0 },
  { upsert: true },
);
db.scopes.replaceOne(
  { scope: "belonging_population" },
  { scope: "belonging_population", fd: "IDENTITY", label: "", __v: 0 },
  { upsert: true },
);
db.scopes.replaceOne(
  { scope: "phone" },
  { scope: "phone", fd: "IDENTITY", label: "", __v: 0 },
  { upsert: true },
);
db.scopes.replaceOne(
  { scope: "chorusdt" },
  { scope: "chorusdt", fd: "IDENTITY", label: "", __v: 0 },
  { upsert: true },
);
db.scopes.replaceOne(
  { scope: "idp_id" },
  { scope: "idp_id", fd: "IDENTITY", label: "", __v: 0 },
  { upsert: true },
);
db.scopes.replaceOne(
  { scope: "idp_acr" },
  { scope: "idp_acr", fd: "IDENTITY", label: "", __v: 0 },
  { upsert: true },
);
db.scopes.replaceOne(
  { scope: "custom" },
  { scope: "custom", fd: "IDENTITY", label: "", __v: 0 },
  { upsert: true },
);
db.scopes.replaceOne(
  { scope: "roles" },
  { scope: "roles", fd: "IDENTITY", label: "", __v: 0 },
  { upsert: true },
);
db.scopes.replaceOne(
  { scope: "organization_label" },
  { scope: "organization_label", fd: "IDENTITY", label: "", __v: 0 },
  { upsert: true },
);

// -- Scopes - Desk
print("Initializing Desk scopes...");
db.scopes.replaceOne(
  { scope: "groups" },
  {
    scope: "groups",
    fd: "DESK",
    label: "Groupes La Suite Numérique",
    __v: 0,
  },
  { upsert: true },
);
