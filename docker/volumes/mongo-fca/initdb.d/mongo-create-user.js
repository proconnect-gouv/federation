print("Creating Mongo User");
db.getSiblingDB("admin").auth("rootAdmin", "pass");
db.createUser({
  user: "fc",
  pwd: "pass",
  roles: [
    /**
     * @todo rename `corev2` into `core-fca`
     */
    { role: "dbOwner", db: "corev2" },
    { role: "readWrite", db: "corev2" }
  ]
});
