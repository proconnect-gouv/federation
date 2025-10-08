!function() {
  if (hostname() !== "mongo-fca-low") {
    throw new Error("This script should be run locally only.");
  }
  db.accountFca.deleteMany({});
  function uuidv4() {
    return UUID().hex().replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
  }

  const targetIdpUid = "71144ab3-ee1a-4401-b7b3-79b44f7daeeb";

  // Documents covering edge cases
  const accounts = [
    // Has matching sub-A with old mail — should update
    {
      sub: "9DD0949F-63AA-4F1E-AE3D-C5F2326B3503",
      createdAt: new Date("2024-01-01T00:00:00Z"),
      id: "9DD0949F-63AA-4F1E-AE3D-C5F2326B3504",
      idpIdentityKeys: [
        { idpUid: targetIdpUid, idpSub: "sub-A", idpMail: "alice@old.example" }
      ],
      active: true,
      updatedAt: new Date("2024-01-02T00:00:00Z"),
      lastConnection: new Date("2024-01-03T00:00:00Z")
    },
    // Multiple keys in one doc: one match (sub-B), one non-target uid (should remain unchanged)
    {
      sub: "9DD0949F-63AA-4F1E-AE3D-C5F2326B3505",
      createdAt: new Date("2024-02-01T00:00:00Z"),
      id: "9DD0949F-63AA-4F1E-AE3D-C5F2326B3506",
      idpIdentityKeys: [
        { idpUid: targetIdpUid, idpSub: "sub-B" },
        { idpUid: "0e7c099f-fe86-49a0-b7d1-19df45397212", idpSub: "sub-Z", idpMail: "zeta@example.com" }
      ],
      active: false
    },
    // sub-C not present in PCI export data - no update expected
    {
      sub: "9DD0949F-63AA-4F1E-AE3D-C5F2326B3507",
      createdAt: new Date("2024-03-01T00:00:00Z"),
      id: "9DD0949F-63AA-4F1E-AE3D-C5F2326B3508",
      idpIdentityKeys: [
        { idpUid: targetIdpUid, idpSub: "sub-C" }
      ],
      active: true
    },
    // sub-D already has same email as PCI export data - no update expected
    {
      sub: "9DD0949F-63AA-4F1E-AE3D-C5F2326B3607",
      createdAt: new Date("2024-11-28T23:59:00Z"),
      id: "9DD0949F-63AA-4F1E-AE3D-C5F2326B3608",
      idpIdentityKeys: [
        { idpUid: targetIdpUid, idpSub: "sub-D", idpMail: "already-set@example.com" }
      ],
      updatedAt: new Date("2024-11-28T23:59:00Z"),
      active: true
    },
    // Has idpIdentityKeys for other uid only — should not be updated; creation of new docs for sub-new-* must be separate docs
    {
      sub: "9DD0949F-63AA-4F1E-AE3D-C5F2326B3509",
      createdAt: new Date("2024-04-01T00:00:00Z"),
      id: "9DD0949F-63AA-4F1E-AE3D-C5F2326B350A",
      idpIdentityKeys: [
        { idpUid: "0e7c099f-fe86-49a0-b7d1-19df45397212", idpSub: "sub-A", idpMail: "dora@old.example" }
      ],
      active: true
    },
    // Empty idpIdentityKeys array — should be ignored by update step; will not block creation of new docs
    {
      sub: "9DD0949F-63AA-4F1E-AE3D-C5F2326B350B",
      createdAt: new Date("2024-05-01T00:00:00Z"),
      id: "9DD0949F-63AA-4F1E-AE3D-C5F2326B350C",
      idpIdentityKeys: [],
      active: true
    },
  ];

  for (let i = 0; i < 800000; i++) {
    accounts.push({
      sub: uuidv4(),
      createdAt: new Date("2024-06-01T00:00:00Z"),
      id: uuidv4(),
      idpIdentityKeys: [
        { idpUid: i < 300000 ? targetIdpUid: uuidv4(), idpSub: `pci-${i}` }
      ],
      active: true
    });
  }

  // Insert accounts
  const result = db.accountFca.insertMany(accounts, { ordered: true });
  print(`Inserted ${result.insertedCount || Object.keys(result.insertedIds || {}).length} documents into accountFca`);
}();
