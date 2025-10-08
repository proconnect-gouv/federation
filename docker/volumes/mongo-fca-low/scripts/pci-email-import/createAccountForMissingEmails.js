targetIdpUid = "71144ab3-ee1a-4401-b7b3-79b44f7daeeb";
now = new Date();

// Pull all mappings for the target IdP, including export-createdAt
const mappings = db.pciUserExport.find({ idpUid: targetIdpUid }).toArray();

// Build a set of existing (uid,sub) pairs
const existingPairs = new Set(
  db.accountFca.aggregate([
    { $project: { _id: 0, idpIdentityKeys: { $ifNull: ["$idpIdentityKeys", []] } } },
    { $unwind: "$idpIdentityKeys" },
    { $match: { "idpIdentityKeys.idpUid": targetIdpUid } },
    { $project: { key: { $concat: ["$idpIdentityKeys.idpUid", "::", "$idpIdentityKeys.idpSub"] } } }
  ]).toArray().map(d => d.key)
);

const inserts = [];
for (const m of mappings) {
  // basic validation
  if (!m.idpUid || !m.idpSub || !m.idpMail) continue;
  const key = `${m.idpUid}::${m.idpSub}`;
  if (!existingPairs.has(key)) {
    inserts.push({
      sub: UUID().hex().replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5'), // UUID v4 string
      id: UUID().hex().replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5'), // optional if you also track a separate id
      createdAt: m.createdAt ? new Date(m.createdAt) : now, // use export creation date
      idpIdentityKeys: [{ idpUid: m.idpUid, idpSub: m.idpSub, idpMail: m.idpMail }],
      active: true,
      updatedAt: now // set updatedAt for newly created docs
      // lastConnection: not set
    });
  }
}