const accountsFca = {
  // -- User E000001 already deactivated for test purpose
  deactivated: {
    _id: ObjectId("5d7a1f9242026edfc3e8a91e"),
    sub: "2c98c3a8-5094-45e9-9c85-7e453323c328",
    createdAt: new Date("2024-05-11T11:16:23.540Z"),
    idpIdentityKeys: [
      {
        idpUid: "9c716f61-b8a1-435c-a407-ef4d677ec270",
        idpSub: "92ca6417-634a-467a-b65b-c89088d97ec9",
        idpMail: "user-deactivated@fia1.fr",
      },
    ],
    active: false,
    lastConnection: new Date("2024-05-11T11:16:23.540Z"),
    __v: 1,
  },
  // -- User 12355 with multiple idp sub
  multipleIdpSub: {
    _id: ObjectId("5eedbcb60c59aa5a1f1a56e3"),
    sub: "d68cec59-ed65-48ab-bfbf-1ca65dd807f8",
    createdAt: new Date("2024-05-11T11:16:23.540Z"),
    lastConnection: new Date("2024-05-11T11:16:23.540Z"),
    idpIdentityKeys: [
      {
        idpUid: "9c716f61-b8a1-435c-a407-ef4d677ec270", // fia1
        idpSub:
          "e3322382e75c0d0a8e95f80af703932bd3c38f940aa59ad08b1cb4900998578c",
        idpMail: "user-multiple-idp@fia1.fr",
      },
      {
        idpUid: "0e7c099f-fe86-49a0-b7d1-19df45397212", // fia2
        idpSub: "s7Ht2K9pL5mN8vX3cR4wQ",
        idpMail: "user-multiple-idp@fia2.fr",
      },
    ],
    active: true,
    __v: 1,
  },
};

Object.entries(accountsFca).forEach(([key, account]) => {
  print(`${key} > Initializing user account: ${key}...`);
  db.accountFca.replaceOne({ _id: account._id }, account, { upsert: true });
});
