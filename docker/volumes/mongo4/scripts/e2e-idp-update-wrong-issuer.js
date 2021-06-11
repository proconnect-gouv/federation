db.provider.update(
  { name: "fip2v2" },
  {
    $set: {
      title: "aGreatTitle",
      url: "https://fip1v2.docker.dev-franceconnect.fr",
    }
  }
)
