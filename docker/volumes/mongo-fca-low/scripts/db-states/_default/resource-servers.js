const resourceServers = {
  "DPA1-LOW": {
    name: "Serveur de ressources Mock - 1",
    title: "Serveur de ressources Mock - 1",
    active: true,
    scopes: ["groups"],
    key: "423dcbdc5a15ece61ed00ff5989d72379c26d9ed4c8e4e05a87cffae019586e0",
    client_secret:
      // client_secret decrypted : 36aa214e7a0043c8da60ae991d8908947147d637137c5bf14bc2fc53e1055847
      "VZdGyhdVO6Axm1yqR3RYKqQdI7r4jHScaiqzCAfvh1ZEEnY5L3g4zPHqMJIx5V70Iff9B6IOfmiQQrw6AeR6Bq16P4CzGe3kC5HNinR7oc6e68STyJhE+T9EMlY=",
    jwks_uri: "https://dpa1-low.docker.dev-franceconnect.fr/api/v1/jwks",
    introspection_signed_response_alg: "ES256",
    introspection_encrypted_response_alg: "ECDH-ES",
    introspection_encrypted_response_enc: "A256GCM",
    id_token_signed_response_alg: "ES256",
    userinfo_signed_response_alg: "ES256",
    redirect_uris: [],
    post_logout_redirect_uris: [],
    response_types: [],
    grant_types: [],
    type: "private",
  },
  "DPA2-LOW": {
    name: "Serveur de ressources Mock - 2",
    title: "Serveur de ressources Mock - 2",
    active: true,
    scopes: ["groups"],
    key: "71c27fec9540e5aa30b34f8c012154f88f8416530b25f31ba4873a2e58e3d3fe",
    client_secret:
      // client_secret decrypted : 36aa214e7a0043c8da60ae991d8908947147d637137c5bf14bc2fc53e1055847
      "VZdGyhdVO6Axm1yqR3RYKqQdI7r4jHScaiqzCAfvh1ZEEnY5L3g4zPHqMJIx5V70Iff9B6IOfmiQQrw6AeR6Bq16P4CzGe3kC5HNinR7oc6e68STyJhE+T9EMlY=",
    jwks_uri: "https://dpa2-low.docker.dev-franceconnect.fr/api/v1/jwks",
    introspection_signed_response_alg: "ES256",
    introspection_encrypted_response_alg: "RSA-OAEP",
    introspection_encrypted_response_enc: "A256GCM",
    id_token_signed_response_alg: "ES256",
    userinfo_signed_response_alg: "ES256",
    redirect_uris: [],
    post_logout_redirect_uris: [],
    response_types: [],
    grant_types: [],
    type: "private",
  },
};
/* ------------------------------------------------------------------------------- */
Object.values(resourceServers).forEach((resourceServer) => {
  print(`${resourceServer.name} > Initializing data provider: ${resourceServer.name}`);
  db.client.replaceOne({ name: resourceServer.name }, resourceServer, { upsert: true });
});
