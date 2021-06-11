db.client.update(
  { name: "FSP - FSP1v2" },
  {
    $set: {
      scopes: [
        "openid",
        "given_name",
        "family_name",
        "birthdate",
        "gender",
      ],
    }
  }
)
