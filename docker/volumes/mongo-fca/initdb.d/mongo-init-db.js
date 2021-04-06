// == FI
const fia = {
  // -- FIA - FIA1V2 - Activated
  FIA1V2: {
    uid: "fia1v2",
    name: "fia1v2",
    active: true,
    display: true,
    title: "Identity Provider 1 - eIDAS élevé",
    image: "demonstration_eleve.png",
    imageFocus: "demonstration_eleve_hover.png",
    alt: "impots",
    eidas: 3,
    mailto: "",
    featureHandlers: {
      coreVerify: "core-fca-default-verify",
      authenticationEmail: null,
    },
    specificText: "specific text fia1v2",
    url: "https://fia1v2.docker.dev-franceconnect.fr/",
    statusURL: "https://fia1v2.docker.dev-franceconnect.fr/",
    authzURL: "https://fia1v2.docker.dev-franceconnect.fr/user/authorize",
    tokenURL: "https://fia1v2.docker.dev-franceconnect.fr/user/token",
    userInfoURL: "https://fia1v2.docker.dev-franceconnect.fr/api/user",
    discoveryUrl:
      "https://fia1v2.docker.dev-franceconnect.fr/.well-known/openid-configuration",
    discovery: true,
    clientID: "myclientidforfia1v2",
    client_secret:
      "jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE",
    order: null,
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    endSessionURL:
      "https://fia1v2.docker.dev-franceconnect.fr/user/session/end",
    response_types: ["code"],
    id_token_signed_response_alg: "ES256",
    token_endpoint_auth_method: "client_secret_post",
    revocation_endpoint_auth_method: "client_secret_post",
    id_token_encrypted_response_alg: "RSA-OAEP",
    id_token_encrypted_response_enc: "A256GCM",
    userinfo_signed_response_alg: "ES256",
    userinfo_encrypted_response_alg: "RSA-OAEP",
    userinfo_encrypted_response_enc: "A256GCM",
    redirect_uris: [
      "https://fca.docker.dev-franceconnect.fr/api/v2/oidc-callback/fia1v2",
    ],
    post_logout_redirect_uris: [
      "https://fca.docker.dev-franceconnect.fr/api/v2/logout/redirect-from-idp",
    ],
  },

  // -- FIA - FIA2V2 - Activated
  FIA2V2: {
    uid: "fia2v2",
    name: "fia2v2",
    active: true,
    display: true,
    title: "Identity Provider 2 - eIDAS substanciel",
    image: "demonstration_eleve.png",
    imageFocus: "demonstration_eleve_hover.png",
    alt: "impots",
    eidas: 2,
    mailto: "",
    featureHandlers: {
      coreVerify: "core-fca-default-verify",
      authenticationEmail: null,
    },
    specificText: "specific text fia2v2",
    url: "https://fia2v2.docker.dev-franceconnect.fr/",
    statusURL: "https://fia2v2.docker.dev-franceconnect.fr/",
    authzURL: "https://fia2v2.docker.dev-franceconnect.fr/user/authorize",
    tokenURL: "https://fia2v2.docker.dev-franceconnect.fr/user/token",
    userInfoURL: "https://fia2v2.docker.dev-franceconnect.fr/api/user",
    discoveryUrl:
      "https://fia2v2.docker.dev-franceconnect.fr/.well-known/openid-configuration",
    discovery: true,
    clientID: "myclientidforfia2v2",
    client_secret:
      "jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE",
    order: null,
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    endSessionURL:
      "https://fia2v2.docker.dev-franceconnect.fr/user/session/end",
    response_types: ["code"],
    id_token_signed_response_alg: "ES256",
    token_endpoint_auth_method: "client_secret_post",
    revocation_endpoint_auth_method: "client_secret_post",
    id_token_encrypted_response_alg: "",
    id_token_encrypted_response_enc: "",
    userinfo_signed_response_alg: "ES256",
    userinfo_encrypted_response_alg: "",
    userinfo_encrypted_response_enc: "",
    redirect_uris: [
      "https://fca.docker.dev-franceconnect.fr/api/v2/oidc-callback/fia2v2",
    ],
    post_logout_redirect_uris: [
      "https://fca.docker.dev-franceconnect.fr/api/v2/logout/redirect-from-idp",
    ],
  },

  // -- FIA - FIA3V2 - Deactivated but visible
  FIA3V2: {
    uid: "fia-desactive-visible",
    name: "fia3v2",
    active: false,
    display: true,
    title: "Identity Provider 3 (désactivé)- eIDAS faible",
    image: "demonstration_eleve.png",
    imageFocus: "demonstration_eleve_hover.png",
    alt: "impots",
    eidas: 1,
    mailto: "",
    featureHandlers: {
      coreVerify: "core-fca-default-verify",
      authenticationEmail: null,
    },
    specificText: "specific text fia3v2",
    url: "https://fia3v2.docker.dev-franceconnect.fr/",
    statusURL: "https://fia3v2.docker.dev-franceconnect.fr/",
    authzURL: "https://fia3v2.docker.dev-franceconnect.fr/user/authorize",
    tokenURL: "https://fia3v2.docker.dev-franceconnect.fr/user/token",
    userInfoURL: "https://fia3v2.docker.dev-franceconnect.fr/api/user",
    discoveryUrl:
      "https://fia3v2.docker.dev-franceconnect.fr/.well-known/openid-configuration",
    discovery: true,
    clientID: "myclientidforfia3v2",
    client_secret:
      "jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE",
    order: null,
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    endSessionURL:
      "https://fia3v2.docker.dev-franceconnect.fr/user/session/end",
    response_types: ["code"],
    id_token_signed_response_alg: "ES256",
    token_endpoint_auth_method: "client_secret_post",
    revocation_endpoint_auth_method: "client_secret_post",
    id_token_encrypted_response_alg: "",
    id_token_encrypted_response_enc: "",
    userinfo_signed_response_alg: "ES256",
    userinfo_encrypted_response_alg: "",
    userinfo_encrypted_response_enc: "",
    redirect_uris: [
      "https://fca.docker.dev-franceconnect.fr/api/v2/oidc-callback/fia3v2",
    ],
    post_logout_redirect_uris: [
      "https://fca.docker.dev-franceconnect.fr/api/v2/logout/redirect-from-idp",
    ],
  },

  // -- FIA - FIA4V2 - Activated - HS256
  FIA4V2: {
    uid: "fia4v2",
    name: "fia4v2",
    active: true,
    display: true,
    title: "Identity Provider 4 - eIDAS élevé - HS256",
    image: "demonstration_eleve.png",
    imageFocus: "demonstration_eleve_hover.png",
    alt: "impots",
    eidas: 3,
    featureHandlers: {
      coreVerify: "core-fca-default-verify",
      authenticationEmail: null,
    },
    mailto: "",
    specificText: "specific text fia4v2",
    url: "https://fia4v2.docker.dev-franceconnect.fr/",
    statusURL: "https://fia4v2.docker.dev-franceconnect.fr/",
    authzURL: "https://fia4v2.docker.dev-franceconnect.fr/user/authorize",
    tokenURL: "https://fia4v2.docker.dev-franceconnect.fr/user/token",
    userInfoURL: "https://fia4v2.docker.dev-franceconnect.fr/api/user",
    discoveryUrl:
      "https://fia4v2.docker.dev-franceconnect.fr/.well-known/openid-configuration",
    discovery: true,
    clientID: "myclientidforfia4v2",
    client_secret:
      "jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE",
    order: null,
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    endSessionURL:
      "https://fia4v2.docker.dev-franceconnect.fr/user/session/end",
    response_types: ["code"],
    id_token_signed_response_alg: "HS256",
    token_endpoint_auth_method: "client_secret_post",
    revocation_endpoint_auth_method: "client_secret_post",
    id_token_encrypted_response_alg: "RSA-OAEP",
    id_token_encrypted_response_enc: "A256GCM",
    userinfo_signed_response_alg: "HS256",
    userinfo_encrypted_response_alg: "RSA-OAEP",
    userinfo_encrypted_response_enc: "A256GCM",
    redirect_uris: [
      "https://fca.docker.dev-franceconnect.fr/api/v2/oidc-callback/fia4v2",
    ],
    post_logout_redirect_uris: [
      "https://fca.docker.dev-franceconnect.fr/api/v2/logout/redirect-from-idp",
    ],
  },

  // -- FIA - FIA5V2 - activated - RS256
  FIA5V2: {
    uid: "fia5v2",
    name: "fia5v2",
    active: true,
    display: true,
    title: "Identity Provider 5 - eIDAS élevé - RS256",
    image: "demonstration_eleve.png",
    imageFocus: "demonstration_eleve_hover.png",
    alt: "impots",
    eidas: 3,
    featureHandlers: {
      coreVerify: "core-fca-default-verify",
      authenticationEmail: null,
    },
    mailto: "",
    specificText: "specific text fia5v2",
    url: "https://fia5v2.docker.dev-franceconnect.fr/",
    statusURL: "https://fia5v2.docker.dev-franceconnect.fr/",
    authzURL: "https://fia5v2.docker.dev-franceconnect.fr/user/authorize",
    tokenURL: "https://fia5v2.docker.dev-franceconnect.fr/user/token",
    userInfoURL: "https://fia5v2.docker.dev-franceconnect.fr/api/user",
    discoveryUrl:
      "https://fia5v2.docker.dev-franceconnect.fr/.well-known/openid-configuration",
    discovery: true,
    clientID: "myclientidforfia5v2",
    client_secret:
      "jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE",
    order: null,
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    endSessionURL:
      "https://fia5v2.docker.dev-franceconnect.fr/user/session/end",
    response_types: ["code"],
    id_token_signed_response_alg: "RS256",
    token_endpoint_auth_method: "client_secret_post",
    revocation_endpoint_auth_method: "client_secret_post",
    id_token_encrypted_response_alg: "RSA-OAEP",
    id_token_encrypted_response_enc: "A256GCM",
    userinfo_signed_response_alg: "RS256",
    userinfo_encrypted_response_alg: "RSA-OAEP",
    userinfo_encrypted_response_enc: "A256GCM",
    redirect_uris: [
      "https://fca.docker.dev-franceconnect.fr/api/v2/oidc-callback/fia5v2",
    ],
    post_logout_redirect_uris: [
      "https://fca.docker.dev-franceconnect.fr/api/v2/logout/redirect-from-idp",
    ],
  },
};

// == FS
const fsa = {
  // -- FSA - FSA1v2 - Activated - HS256 - no encrypted response
  FSA1V2: {
    name: "FSA - FSA1v2",
    title: "FSA - FSA1v2 Title",
    site: "https://site.com",
    redirect_uris: [
      "https://fsa1v2.docker.dev-franceconnect.fr/oidc-callback/envIssuer",
    ],
    post_logout_redirect_uris: [
      "https://fsa1v2.docker.dev-franceconnect.fr/logout-callback",
    ],
    client_secret:
      "+sqGL4XE6aqzIMOp/DKC1jWB8I+8qE1jW6iz2tUv8lt+ZZzxjyoCBQeuAcJTFZxfLywkn6cAICK5JPLxYM0+8pk/q7CGHUfr/gzr3ZYRroWWE+egEEDxqRYDYe0=",
    key: "6925fb8143c76eded44d32b40c0cb1006065f7f003de52712b78985704f39950",
    entityId:
      "aa41f9fa5752420a516422a4bf98c09f11e1617d9ebddd4b545cc5cc109680bc",
    credentialsFlow: false,
    email: "fsa1@franceconnect.loc",
    IPServerAddressesAndRanges: ["1.1.1.1"],
    active: true,
    type: "public",
    __v: 4,
    featureHandlers: { none: "" },
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    scopes: [
      "uid",
      "openid",
      "given_name",
      "email",
      "phone",
      "organizational_unit",
      "siren",
      "siret",
      "usual_name",
      "belonging_population",
      "chorusdt",
    ],
    id_token_signed_response_alg: "HS256",
    id_token_encrypted_response_alg: "",
    id_token_encrypted_response_enc: "",
    userinfo_signed_response_alg: "HS256",
    userinfo_encrypted_response_alg: "",
    userinfo_encrypted_response_enc: "",
    jwks_uri:
      "https://fsa1v2.docker.dev-franceconnect.fr/client/.well-known/keys",
    idpFilterExclude: true,
    idpFilterList: ["fia3v2", "fia5v2"],
  },

  // -- FSA - FSA2v2 - Activated - ES256 - encrypted response
  FSA2V2: {
    name: "FSA - FSA2v2",
    title: "FSA - FSA2v2 Title",
    site: "https://site.com",
    redirect_uris: [
      "https://fsa2v2.docker.dev-franceconnect.fr/oidc-callback/envIssuer",
    ],
    post_logout_redirect_uris: [
      "https://fsa2v2.docker.dev-franceconnect.fr/logout-callback",
    ],
    client_secret:
      "+sqGL4XE6aqzIMOp/DKC1jWB8I+8qE1jW6iz2tUv8lt+ZZzxjyoCBQeuAcJTFZxfLywkn6cAICK5JPLxYM0+8pk/q7CGHUfr/gzr3ZYRroWWE+egEEDxqRYDYe0=",
    key: "7a79e45107f9ccc6a3a5971d501220dc4fd9e87bb5e3fc62ce4104c756e22775",
    entityId:
      "aa41f9fa5752420a516422a4bf98c09f11e1617d9ebddd4b545cc5cc109680bc",
    credentialsFlow: false,
    email: "fsa2@franceconnect.loc",
    IPServerAddressesAndRanges: ["1.1.1.1"],
    active: true,
    type: "public",
    __v: 4,
    featureHandlers: { none: "" },
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    scopes: [
      "uid",
      "openid",
      "given_name",
      "email",
      "phone",
      "organizational_unit",
      "siren",
      "siret",
      "usual_name",
      "belonging_population",
      "chorusdt",
    ],
    id_token_signed_response_alg: "ES256",
    id_token_encrypted_response_alg: "",
    id_token_encrypted_response_enc: "",
    userinfo_signed_response_alg: "ES256",
    userinfo_encrypted_response_alg: "",
    userinfo_encrypted_response_enc: "",
    jwks_uri:
      "https://fsa2v2.docker.dev-franceconnect.fr/client/.well-known/keys",
    idpFilterExclude: false,
    idpFilterList: ["fia1v2", "fia2v2", "fia-desactive-visible", "fia5v2"],
  },

  // -- FSA - FSA3v2 - Deactivated
  FSA3V2: {
    name: "Service Provider Example 3 deactivated",
    title: "FSA - FSA3v2 Title",
    site: "https://site.com",
    redirect_uris: [
      "https://fsa3v2.docker.dev-franceconnect.fr/oidc-callback/envIssuer",
    ],
    post_logout_redirect_uris: [
      "https://fsa3v2.docker.dev-franceconnect.fr/logout-callback",
    ],
    client_secret:
      "+sqGL4XE6aqzIMOp/DKC1jWB8I+8qE1jW6iz2tUv8lt+ZZzxjyoCBQeuAcJTFZxfLywkn6cAICK5JPLxYM0+8pk/q7CGHUfr/gzr3ZYRroWWE+egEEDxqRYDYe0=",
    key: "my-service-provider-deactivated",
    entityId: "my-service-provider-deactivated",
    credentialsFlow: false,
    email: "fsa3@franceconnect.loc",
    IPServerAddressesAndRanges: ["1.1.1.1"],
    active: false,
    type: "public",
    __v: 4,
    featureHandlers: { none: "" },
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    scopes: [
      "uid",
      "openid",
      "given_name",
      "email",
      "phone",
      "organizational_unit",
      "siren",
      "siret",
      "usual_name",
      "belonging_population",
      "chorusdt",
    ],
    id_token_signed_response_alg: "ES256",
    id_token_encrypted_response_alg: "RSA-OAEP",
    id_token_encrypted_response_enc: "A256GCM",
    userinfo_signed_response_alg: "ES256",
    userinfo_encrypted_response_alg: "RSA-OAEP",
    userinfo_encrypted_response_enc: "A256GCM",
    jwks_uri:
      "https://fsa3v2.docker.dev-franceconnect.fr/client/.well-known/keys",
    idpFilterExclude: true,
    idpFilterList: [],
  },

  // -- FSA - FSA4v2 - Activated - RS256 - encrypted response
  FSA4V2: {
    name: "FSA - FSA4v2",
    title: "FSA - FSA4v2 Title",
    site: "https://site.com",
    redirect_uris: [
      "https://fsa4v2.docker.dev-franceconnect.fr/oidc-callback/envIssuer",
    ],
    post_logout_redirect_uris: [
      "https://fsa4v2.docker.dev-franceconnect.fr/logout-callback",
    ],
    client_secret:
      "+sqGL4XE6aqzIMOp/DKC1jWB8I+8qE1jW6iz2tUv8lt+ZZzxjyoCBQeuAcJTFZxfLywkn6cAICK5JPLxYM0+8pk/q7CGHUfr/gzr3ZYRroWWE+egEEDxqRYDYe0=",
    key: "6495f347513b860e6b931fae4a1ba70c8489a558a0fc74ecdc094d48a4035e77",
    entityId:
      "aa41f9fa5752420a516422a4bf98c09f11e1617d9ebddd4b545cc5cc109680bc",
    credentialsFlow: false,
    email: "fsa4@franceconnect.loc",
    IPServerAddressesAndRanges: ["1.1.1.1"],
    active: true,
    type: "public",
    __v: 4,
    featureHandlers: { none: "" },
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    scopes: [
      "uid",
      "openid",
      "given_name",
      "email",
      "phone",
      "organizational_unit",
      "siren",
      "siret",
      "usual_name",
      "belonging_population",
      "chorusdt",
    ],
    id_token_signed_response_alg: "RS256",
    id_token_encrypted_response_alg: "",
    id_token_encrypted_response_enc: "",
    userinfo_signed_response_alg: "RS256",
    userinfo_encrypted_response_alg: "",
    userinfo_encrypted_response_enc: "",
    jwks_uri:
      "https://fsa4v2.docker.dev-franceconnect.fr/client/.well-known/keys",
    idpFilterExclude: false,
    idpFilterList: ["fia1v2", "fia2v2", "fia4v2", "fia5v2"],
  },
};

// == ACCOUNTS
const accounts = {
  // -- User Account already desactivated for tests purposes
  E000001: {
    id: "E000001",
    identityHash: "0Wdvi71EZ/Wgb7ft4ThutSqsHzHNOaCELeFYm0IepmY=",
    updatedAt: new Date("2019-12-11T12:16:26.931Z"),
    createdAt: new Date("2019-12-11T11:16:23.540Z"),
    active: false,
    servicesProvidersFederationKeys: [
      {
        sub:
          "905beb1f04ff647171cb62bfa81f95d7c6f578709997f09c0e5b0d68be722a13v1",
        clientId:
          "a0cd64372db6ecf39c317c0c74ce90f02d8ad7d510ce054883b759d666a996bc",
      },
    ],
    federationKeys: [
      {
        clientId: "fia1v2",
        sub: "fim55",
        matchRNIPP: false,
      },
    ],
    __v: 1,
    noDisplayConfirmation: false,
  },
};

// == MINISTRIES
const ministries = [
  {
    id: "ministry1",
    acronym: "MO1",
    sort: 2,
    name: "Ministry One - All FIs - sort 2",
    identityProviders: ["fia1v2", "fia2v2", "fia-desactive-visible"],
    updatedAt: new Date("2020-12-09T12:00:00.000Z"),
    createdAt: new Date("2020-12-09T12:00:00.000Z"),
    __v: 1,
  },
  {
    id: "ministry2",
    acronym: "MO2",
    sort: 1,
    name: "Ministry Two - Some FIs Disabled - sort 1",
    identityProviders: ["fia1v2", "fia-desactive-visible"],
    updatedAt: new Date("2020-12-09T12:00:00.000Z"),
    createdAt: new Date("2020-12-09T12:00:00.000Z"),
    __v: 1,
  },
  {
    id: "MINISTRY3",
    acronym: "MO3",
    sort: 3,
    name: "Ministry Three - No FIs - sort 3",
    identityProviders: [],
    updatedAt: new Date("2020-12-09T12:00:00.000Z"),
    createdAt: new Date("2020-12-09T12:00:00.000Z"),
    __v: 1,
  },
  {
    id: "ministry4",
    sort: 4,
    name: "Ministry Three - E2E - sort 4",
    identityProviders: ["fia4v2", "fia5v2"],
    updatedAt: new Date("2020-12-09T12:00:00.000Z"),
    createdAt: new Date("2020-12-09T12:00:00.000Z"),
    __v: 1,
  },
  {
    id: "ANSC",
    acronym: "ANSC",
    sort: 4,
    name: "Agence Nationale Sécurité Civile",
    identityProviders: [],
    updatedAt: new Date("2021-01-12T12:00:00.000Z"),
    createdAt: new Date("2021-01-12T12:00:00.000Z"),
    __v: 1,
  },
  {
    id: "SPM",
    acronym: "SPM",
    sort: 5,
    name: "Service du 1er Ministre",
    identityProviders: [],
    updatedAt: new Date("2021-01-12T12:00:00.000Z"),
    createdAt: new Date("2021-01-12T12:00:00.000Z"),
    __v: 1,
  },
  {
    id: "MAE",
    acronym: "MAE",
    sort: 6,
    name: "Ministère des affaires étrangères",
    identityProviders: [],
    updatedAt: new Date("2021-01-12T12:00:00.000Z"),
    createdAt: new Date("2021-01-12T12:00:00.000Z"),
    __v: 1,
  },
  {
    id: "MTE",
    acronym: "MTE",
    sort: 7,
    name: "Ministère de la Transition écologique",
    identityProviders: [],
    updatedAt: new Date("2021-01-12T12:00:00.000Z"),
    createdAt: new Date("2021-01-12T12:00:00.000Z"),
    __v: 1,
  },
  {
    id: "MENJS",
    acronym: "MENJS",
    sort: 8,
    name: "Ministère de l'Éducation nationale,de la Jeunesse et des Sports",
    identityProviders: [],
    updatedAt: new Date("2021-01-12T12:00:00.000Z"),
    createdAt: new Date("2021-01-12T12:00:00.000Z"),
    __v: 1,
  },
  {
    id: "MEFR",
    acronym: "MEFR",
    sort: 9,
    name: "Ministère de l'Économie, des Finances et de la Relance",
    identityProviders: [],
    updatedAt: new Date("2021-01-12T12:00:00.000Z"),
    createdAt: new Date("2021-01-12T12:00:00.000Z"),
    __v: 1,
  },
  {
    id: "MA",
    acronym: "MA",
    sort: 10,
    name: "Ministère des Armées",
    identityProviders: [],
    updatedAt: new Date("2021-01-12T12:00:00.000Z"),
    createdAt: new Date("2021-01-12T12:00:00.000Z"),
    __v: 1,
  },
  {
    id: "MI",
    acronym: "MI",
    sort: 11,
    name: "Ministère de l'intérieur",
    identityProviders: [],
    updatedAt: new Date("2021-01-12T12:00:00.000Z"),
    createdAt: new Date("2021-01-12T12:00:00.000Z"),
    __v: 1,
  },
  {
    id: "MTEI",
    acronym: "MTEI",
    sort: 12,
    name: "Ministère du Travail,de l'Emploi et de l'Insertion",
    identityProviders: [],
    updatedAt: new Date("2021-01-12T12:00:00.000Z"),
    createdAt: new Date("2021-01-12T12:00:00.000Z"),
    __v: 1,
  },
  {
    id: "MOM",
    acronym: "MOM",
    sort: 13,
    name: "Ministère des Outre-mer",
    identityProviders: [],
    updatedAt: new Date("2021-01-12T12:00:00.000Z"),
    createdAt: new Date("2021-01-12T12:00:00.000Z"),
    __v: 1,
  },
  {
    id: "MCTRCT",
    acronym: "",
    sort: 14,
    name:
      "Ministère de la Cohésion des territoires et des Relationsavec les collectivités territoriales",
    identityProviders: [],
    updatedAt: new Date("2021-01-12T12:00:00.000Z"),
    createdAt: new Date("2021-01-12T12:00:00.000Z"),
    __v: 1,
  },
  {
    id: "MJ",
    acronym: "MJ",
    sort: 15,
    name: "Ministère de la Justice",
    identityProviders: [],
    updatedAt: new Date("2021-01-12T12:00:00.000Z"),
    createdAt: new Date("2021-01-12T12:00:00.000Z"),
    __v: 1,
  },
  {
    id: "MC",
    acronym: "MC",
    sort: 16,
    name: "Ministère de la Culture",
    identityProviders: [],
    updatedAt: new Date("2021-01-12T12:00:00.000Z"),
    createdAt: new Date("2021-01-12T12:00:00.000Z"),
    __v: 1,
  },
  {
    id: "MSS",
    acronym: "MSS",
    sort: 17,
    name: "Ministère des Solidarités et de la Santé",
    identityProviders: [],
    updatedAt: new Date("2021-01-12T12:00:00.000Z"),
    createdAt: new Date("2021-01-12T12:00:00.000Z"),
    __v: 1,
  },
  {
    id: "MM",
    acronym: "",
    sort: 4,
    name: "Ministère de la Mer",
    identityProviders: [],
    updatedAt: new Date("2021-01-12T12:00:00.000Z"),
    createdAt: new Date("2021-01-12T12:00:00.000Z"),
    __v: 1,
  },
  {
    id: "MESRI",
    acronym: "MESRI",
    sort: 19,
    name:
      "Ministère de l’Enseignement supérieur, de la Recherche et de l'innovation",
    identityProviders: [],
    updatedAt: new Date("2021-01-12T12:00:00.000Z"),
    createdAt: new Date("2021-01-12T12:00:00.000Z"),
    __v: 1,
  },
  {
    id: "MAA",
    acronym: "MAA",
    sort: 20,
    name: "Ministère de l’Agriculture et de l’Alimentation",
    identityProviders: [],
    updatedAt: new Date("2021-01-12T12:00:00.000Z"),
    createdAt: new Date("2021-01-12T12:00:00.000Z"),
    __v: 1,
  },
  {
    id: "MTFP",
    acronym: "MTFP",
    sort: 21,
    name: "Ministère de la Transformation et de la Fonction publiques",
    identityProviders: [],
    updatedAt: new Date("2021-01-12T12:00:00.000Z"),
    createdAt: new Date("2021-01-12T12:00:00.000Z"),
  },
];

// ===============================================================

db = db.getSiblingDB("corev2");
db.getSiblingDB("corev2").auth("fc", "pass");
print("Initializing App Configuration");

// -- FSs ----------
print("Initializing client: fsa1v2 - activated");
db.client.update({ name: "fsa1v2" }, fsa.FSA1V2, { upsert: true });
print("Initializing client: fsa2v2 - activated");
db.client.update({ name: "fsa2v2" }, fsa.FSA2V2, { upsert: true });
print("Initializing client: fsa3v2 - deactivated");
db.client.update({ name: "fsa3v2" }, fsa.FSA3V2, { upsert: true });
print("Initializing client: fsa4v2 - activated");
db.client.update({ name: "fsa4v2" }, fsa.FSA4V2, { upsert: true });

// -- FIs ----------
print("FIA > Initializing provider: fia1v2 - Activated");
db.provider.update({ name: "fia1v2" }, fia.FIA1V2, { upsert: true });
print("FIA > Initializing provider: fia2v2 - Activated");
db.provider.update({ name: "fia2v2" }, fia.FIA2V2, { upsert: true });
print("FIA > Initializing provider: fia3v2 - Activated");
db.provider.update({ name: "fia3v2" }, fia.FIA3V2, { upsert: true });
print("FIP > Initializing provider: fia4v2 - Activated");
db.provider.update({ name: "fia4v2" }, fia.FIA4V2, { upsert: true });
print("FIP > Initializing provider: fia5v2 - Activated");
db.provider.update({ name: "fia5v2" }, fia.FIA5V2, { upsert: true });

// -- ACCOUNTS -----
print("Initializing user account: E000001...");
db.account.update({ id: "E000001" }, accounts.E000001, { upsert: true });

// -- MINISTRIES -----
ministries.forEach((ministry) => {
  print(`Initializing Ministry :: ${ministry.id}`);
  const options = { upsert: true };
  const which = { id: ministry.id };
  db.ministries.update(which, ministry, options);
});

print("All collections were initialized!");
