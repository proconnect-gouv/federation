!function () {

  function uuidv4() {
    return UUID().hex().replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
  }

  const targetIdpUid = "71144ab3-ee1a-4401-b7b3-79b44f7daeeb";
  const now = new Date();

  // Build a set of existing subs for the target IdP
  const existingSubs = new Set(
    db.accountFca.aggregate([
      { $match: { "idpIdentityKeys": { $elemMatch: { idpUid: targetIdpUid } } } },
      { $project: { _id: 1, idpIdentityKeys: { $ifNull: ["$idpIdentityKeys", []] } } },
      { $unwind: "$idpIdentityKeys" },
      { $match: { "idpIdentityKeys.idpUid": targetIdpUid } },
      { $project: { idpSub: "$idpIdentityKeys.idpSub" } }
    ]).toArray().map(d => d.idpSub)
  );

  // Pull all accounts to import
  const pciUsers = db.pciUserExport.find({ idpUid: targetIdpUid }).toArray();

  const writes = [];
  for (const pciUser of pciUsers) {
    if (!existingSubs.has(pciUser.idpSub)) {
      writes.push({
        insertOne: {
          document: {
            sub: uuidv4(),
            id: uuidv4(),
            createdAt: pciUser.createdAt ? new Date(pciUser.createdAt) : now, // use export creation date
            idpIdentityKeys: [{ idpUid: targetIdpUid, idpSub: pciUser.idpSub, idpMail: pciUser.idpMail }],
            active: true,
            updatedAt: now // set updatedAt for newly created docs
          }
        }
      });
    } else {
      // Add an update that sets idpMail on the existing element of the idpIdentityKeys array of the existing document
      // (located using $elemMatch in the query)
      writes.push({
        updateOne: {
          filter: { idpIdentityKeys: { $elemMatch: { idpUid: targetIdpUid, idpSub: pciUser.idpSub } } },
          update: {
            $set: {
              // Updates only the matching array element
              // https://www.mongodb.com/docs/manual/reference/operator/update/positional/
              "idpIdentityKeys.$.idpMail": pciUser.idpMail,
              updatedAt: now
            }
          },
        }
      });
    }
  }

  if (writes.length) {
    const bulkResult = db.accountFca.bulkWrite(writes, { ordered: true });
    // modifiedCount does not seem to be reported; use matchedCount as fallback
    const totalModified = bulkResult.modifiedCount || bulkResult.matchedCount || 0;

    print(`Updated idpMail in ${totalModified} existing documents in accountFca`);
  } else {
    print("No accounts to insert or update");
  }
}();
