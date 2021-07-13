// == ACCOUNTS
const accounts = {
    // -- User Account already desactivated for tests purposes
    E000001: {
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
  };

  // -- ACCOUNTS -----
print("Initializing user account: E000001...");
db.account.update({ id: "E000001" }, accounts.E000001, { upsert: true });