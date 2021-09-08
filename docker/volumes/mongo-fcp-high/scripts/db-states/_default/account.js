// == ACCOUNTS
const accounts = [
    // -- User Account already desactivated for tests purposes
    {
      id: "E000001",
      identityHash: "FBazvqZ/4W7b76RmlV86MH9HNzVkofupYc74cHgInnQ=",
      updatedAt: new Date("2019-12-11T12:16:26.931Z"),
      createdAt: new Date("2019-12-11T11:16:23.540Z"),
      active: false,
      servicesProvidersFederationKeys: [
        {
          sub: "4d46585fce406a96d97cbdc7a3983aa286c85042b3276e3c09bf848c3cfc916dv1",
          clientId:
            "a0cd64372db6ecf39c317c0c74ce90f02d8ad7d510ce054883b759d666a996bc",
        },
      ],
      federationKeys: [
        {
          clientId: "fip1-high",
          sub: "fim55",
          matchRNIPP: false,
        },
      ],
      __v: 1,
      noDisplayConfirmation: false,
    },
    {
      active : true,
      identityHash: "Sr1x7B9YHc4uoiIcvqx8lzxq6nvLg1rN/n1klPFSgGA=",
      lastConnection : ISODate("2021-08-19T14:49:39.945Z"),
      updatedAt : ISODate("2021-08-19T14:49:39.950Z"),
      createdAt : ISODate("2021-08-19T14:49:39.950Z"),
      idpFederation: {
        "fip1-high": {
          sub : "35b5d1ae1093b5e00304ac54fc9fef5c90387ecfa36d4f886e9b9ee23c1bc899v1"
        }
      },
      spFederation : {
        a0cd64372db6ecf39c317c0c74ce90f02d8ad7d510ce054883b759d666a996bc : {
          sub : "4d327dd1e427daf4d50296ab71d6f3fc82ccc40742943521d42cb2bae4df41afv1"
        }
      },
      id : "3ec64565-a907-4284-935a-0ff0213cc120",
      __v : 0
    }
    
];

  // -- ACCOUNTS -----
print("Initializing user account...");
accounts.forEach(account => db.account.update(
    { id: account.id }, account, { upsert: true }
  )
);

