// == FS
const fsa = {
  // -- FSA - FSA1-LOW - Activated - HS256 - no encrypted response
  'FSA1-LOW': {
    name: 'FSA - FSA1-LOW',
    title: 'FSA - FSA1-LOW Title',
    site: 'https://site.com',
    redirect_uris: [
      'https://fsa1-low.docker.dev-franceconnect.fr/oidc-callback',
    ],
    post_logout_redirect_uris: [
      'https://fsa1-low.docker.dev-franceconnect.fr/',
    ],
    client_secret:
      '+sqGL4XE6aqzIMOp/DKC1jWB8I+8qE1jW6iz2tUv8lt+ZZzxjyoCBQeuAcJTFZxfLywkn6cAICK5JPLxYM0+8pk/q7CGHUfr/gzr3ZYRroWWE+egEEDxqRYDYe0=',
    key: '6925fb8143c76eded44d32b40c0cb1006065f7f003de52712b78985704f39950',
    entityId:
      'aa41f9fa5752420a516422a4bf98c09f11e1617d9ebddd4b545cc5cc109680bc',
    credentialsFlow: false,
    email: 'fsa1@franceconnect.loc',
    IPServerAddressesAndRanges: ['1.1.1.1'],
    active: true,
    type: 'public',
    __v: 4,
    featureHandlers: { none: '' },
    updatedAt: new Date('2019-04-24 17:09:17'),
    updatedBy: 'admin',
    scopes: [
      'uid',
      'openid',
      'given_name',
      'email',
      'phone',
      'organizational_unit',
      'siren',
      'siret',
      'usual_name',
      'belonging_population',
      'chorusdt',
      'idp_id',
      'idp_acr',
      'groups',
      'custom',
    ],
    claims: ['amr'],
    introspection_signed_response_alg: null,
    introspection_encrypted_response_alg: null,
    introspection_encrypted_response_enc: null,
    id_token_signed_response_alg: 'HS256',
    userinfo_signed_response_alg: 'HS256',
    jwks_uri:
      'https://fsa1-low.docker.dev-franceconnect.fr/client/.well-known/keys',
  },

  // -- FSA - FSA2-LOW - Activated - ES256 - encrypted response - No post-logout-redirect-uri - Accept private
  'FSA2-LOW': {
    name: 'FSA - FSA2-LOW',
    title: 'FSA - FSA2-LOW Title',
    site: 'https://site.com',
    redirect_uris: [
      'https://fsa2-low.docker.dev-franceconnect.fr/oidc-callback',
    ],
    post_logout_redirect_uris: [
      'https://fsa2-low.docker.dev-franceconnect.fr/',
    ],
    client_secret:
      '+sqGL4XE6aqzIMOp/DKC1jWB8I+8qE1jW6iz2tUv8lt+ZZzxjyoCBQeuAcJTFZxfLywkn6cAICK5JPLxYM0+8pk/q7CGHUfr/gzr3ZYRroWWE+egEEDxqRYDYe0=',
    key: '7a79e45107f9ccc6a3a5971d501220dc4fd9e87bb5e3fc62ce4104c756e22775',
    entityId:
      'aa41f9fa5752420a516422a4bf98c09f11e1617d9ebddd4b545cc5cc109680bc',
    credentialsFlow: false,
    email: 'fsa2@franceconnect.loc',
    IPServerAddressesAndRanges: ['1.1.1.1'],
    active: true,
    type: 'private',
    __v: 4,
    featureHandlers: { none: '' },
    updatedAt: new Date('2019-04-24 17:09:17'),
    updatedBy: 'admin',
    scopes: [
      'uid',
      'openid',
      'given_name',
      'email',
      'phone',
      'organizational_unit',
      'siren',
      'siret',
      'usual_name',
      'belonging_population',
      'chorusdt',
      'idp_id',
      'idp_acr',
      'custom',
    ],
    claims: ['amr'],
    introspection_signed_response_alg: null,
    introspection_encrypted_response_alg: null,
    introspection_encrypted_response_enc: null,
    id_token_signed_response_alg: 'ES256',
    userinfo_signed_response_alg: 'ES256',
    jwks_uri:
      'https://fsa2-low.docker.dev-franceconnect.fr/client/.well-known/keys',
  },

  // -- FSA - FSA3-LOW - Deactivated
  'FSA3-LOW': {
    name: 'Service Provider Example 3 deactivated',
    title: 'FSA - FSA3-LOW Title',
    site: 'https://site.com',
    redirect_uris: [
      'https://fsa3-low.docker.dev-franceconnect.fr/oidc-callback',
    ],
    post_logout_redirect_uris: [
      'https://fsa3-low.docker.dev-franceconnect.fr/',
    ],
    client_secret:
      '+sqGL4XE6aqzIMOp/DKC1jWB8I+8qE1jW6iz2tUv8lt+ZZzxjyoCBQeuAcJTFZxfLywkn6cAICK5JPLxYM0+8pk/q7CGHUfr/gzr3ZYRroWWE+egEEDxqRYDYe0=',
    key: 'my-service-provider-deactivated',
    entityId: 'my-service-provider-deactivated',
    credentialsFlow: false,
    email: 'fsa3@franceconnect.loc',
    IPServerAddressesAndRanges: ['1.1.1.1'],
    active: false,
    type: 'public',
    __v: 4,
    featureHandlers: { none: '' },
    updatedAt: new Date('2019-04-24 17:09:17'),
    updatedBy: 'admin',
    scopes: [
      'uid',
      'openid',
      'given_name',
      'email',
      'phone',
      'organizational_unit',
      'siren',
      'siret',
      'usual_name',
      'belonging_population',
      'chorusdt',
      'idp_id',
      'idp_acr',
      'custom',
    ],
    claims: [],
    introspection_signed_response_alg: null,
    introspection_encrypted_response_alg: null,
    introspection_encrypted_response_enc: null,
    id_token_signed_response_alg: 'ES256',
    userinfo_signed_response_alg: 'ES256',
    jwks_uri:
      'https://fsa3-low.docker.dev-franceconnect.fr/client/.well-known/keys',
  },

  // -- FSA - FSA4-LOW - Activated - RS256 - encrypted response - not autorized to request amr claim
  'FSA4-LOW': {
    name: 'FSA - FSA4-LOW',
    title: 'FSA - FSA4-LOW Title',
    site: 'https://site.com',
    redirect_uris: [
      'https://fsa4-low.docker.dev-franceconnect.fr/oidc-callback',
    ],
    post_logout_redirect_uris: [
      'https://fsa4-low.docker.dev-franceconnect.fr/',
    ],
    client_secret:
      '+sqGL4XE6aqzIMOp/DKC1jWB8I+8qE1jW6iz2tUv8lt+ZZzxjyoCBQeuAcJTFZxfLywkn6cAICK5JPLxYM0+8pk/q7CGHUfr/gzr3ZYRroWWE+egEEDxqRYDYe0=',
    key: '6495f347513b860e6b931fae4a1ba70c8489a558a0fc74ecdc094d48a4035e77',
    entityId:
      'aa41f9fa5752420a516422a4bf98c09f11e1617d9ebddd4b545cc5cc109680bc',
    credentialsFlow: false,
    email: 'fsa4@franceconnect.loc',
    IPServerAddressesAndRanges: ['1.1.1.1'],
    active: true,
    type: 'public',
    __v: 4,
    featureHandlers: { none: '' },
    updatedAt: new Date('2019-04-24 17:09:17'),
    updatedBy: 'admin',
    scopes: [
      'uid',
      'openid',
      'given_name',
      'email',
      'phone',
      'organizational_unit',
      'siren',
      'siret',
      'usual_name',
      // "belonging_population", <-- Removed to test "requested scope not allowed"
      'chorusdt',
      'idp_id',
      'idp_acr',
      'custom',
    ],
    claims: [],
    introspection_signed_response_alg: null,
    introspection_encrypted_response_alg: null,
    introspection_encrypted_response_enc: null,
    id_token_signed_response_alg: 'RS256',
    userinfo_signed_response_alg: 'RS256',
    jwks_uri:
      'https://fsa4-low.docker.dev-franceconnect.fr/client/.well-known/keys',
  },
  'DPA1-LOW': {
    entityId: "6f21b751-ed06-48b6-a59c-36e1300a368a",
    name: "Fournisseur de données Mock - 1",
    title: "Fournisseur de données Mock - 1",
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
    id_token_signed_response_alg: 'ES256',
    userinfo_signed_response_alg: 'ES256',
    redirect_uris: [],
    post_logout_redirect_uris: [],
    response_types: [],
    grant_types: [],
    type: 'private',
  },
  'DPA2-LOW': {
    entityId: "735c6dc3-1e47-41b1-9fa6-6c7f667cfba1",
    name: "Fournisseur de données Mock - 2",
    title: "Fournisseur de données Mock - 2",
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
    id_token_signed_response_alg: 'ES256',
    userinfo_signed_response_alg: 'ES256',
    redirect_uris: [],
    post_logout_redirect_uris: [],
    response_types: [],
    grant_types: [],
    type: 'private',
  }
};

// -- SPs ----------
Object.values(fsa).forEach((fs) => {
  print(`${fs.name} > Initializing client: ${fs.name}`);
  db.client.update({ name: fs.name }, fs, { upsert: true });
});
