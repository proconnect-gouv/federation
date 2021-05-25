// == FI
const fip = {
  // -- FIP - FIP2V2 - Activated
  FIP1V2: {
    uid: "fip1v2",
    name: "fip1v2",
    active: true,
    display: true,
    title: "Identity Provider - eIDAS élevé - discov - crypt",
    image: "fi-mock-eleve.svg",
    imageFocus: "fi-mock-eleve.svg",
    alt: "impots",
    eidas: 3,
    featureHandlers: {
      coreVerify: "core-fcp-default-verify",
      authenticationEmail: "core-fcp-send-email",
      idpIdentityCheck: "core-fcp-default-identity-check",
    },
    mailto: "",
    specificText: "specific text fip1v2",
    url: "https://fip1v2.docker.dev-franceconnect.fr",
    statusURL: "https://fip1v2.docker.dev-franceconnect.fr/",
    discoveryUrl:
      "https://fip1v2.docker.dev-franceconnect.fr/.well-known/openid-configuration",
    discovery: true,
    response_types: ["code"],
    clientID: "09a1a257648c1742c74d6a3d84b31943",
    client_secret:
      "jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE",
    order: null,
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    endSessionURL:
      "https://fip1v2.docker.dev-franceconnect.fr/user/session/end",
    id_token_signed_response_alg: "HS256",
    token_endpoint_auth_method: "client_secret_post",
    revocation_endpoint_auth_method: "client_secret_post",
    id_token_encrypted_response_alg: "RSA-OAEP",
    id_token_encrypted_response_enc: "A256GCM",
    userinfo_signed_response_alg: "HS256",
    userinfo_encrypted_response_alg: "RSA-OAEP",
    userinfo_encrypted_response_enc: "A256GCM",
    redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/oidc-callback/fip1v2",
    ],
    post_logout_redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/logout/redirect-from-idp",
    ],
  },

  // -- FIP - FIP2V2 - Activated
  FIP2V2: {
    uid: "fip2v2",
    name: "fip2v2",
    active: true,
    display: true,
    title: "Identity Provider - eIDAS élevé - nodiscov - nocrypt",
    image: "fi-mock-eleve.svg",
    imageFocus: "fi-mock-eleve.svg",
    alt: "impots",
    eidas: 3,
    featureHandlers: {
      coreVerify: "core-fcp-default-verify",
      authenticationEmail: "core-fcp-send-email",
      idpIdentityCheck: "core-fcp-default-identity-check",
    },
    mailto: "",
    specificText: "specific text fip2v2",
    url: "https://fip2v2.docker.dev-franceconnect.fr",
    statusURL: "https://fip2v2.docker.dev-franceconnect.fr/",
    authzURL: "https://fip2v2.docker.dev-franceconnect.fr/user/authorize",
    tokenURL: "https://fip2v2.docker.dev-franceconnect.fr/user/token",
    userInfoURL: "https://fip2v2.docker.dev-franceconnect.fr/api/user",
    discoveryUrl: "",
    discovery: false,
    clientID: "myclientidforfip2v2",
    client_secret:
      "jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE",
    order: null,
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    endSessionURL:
      "https://fip2v2.docker.dev-franceconnect.fr/user/session/end",
    response_types: ["code"],
    id_token_signed_response_alg: "HS256",
    token_endpoint_auth_method: "client_secret_post",
    revocation_endpoint_auth_method: "client_secret_post",
    id_token_encrypted_response_alg: "",
    id_token_encrypted_response_enc: "",
    userinfo_signed_response_alg: "HS256",
    userinfo_encrypted_response_alg: "",
    userinfo_encrypted_response_enc: "",
    redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/oidc-callback/fip2v2",
    ],
    post_logout_redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/logout/redirect-from-idp",
    ],
  },

  // -- FIP - FIP3V2 - Deactivated but visible
  FIP3V2: {
    uid: "fip-desactive-visible",
    name: "fip-desactive-visible",
    active: false,
    display: true,
    title: "FI désactivé mais visible",
    image: "fi-mock-eleve.svg",
    imageFocus: "fi-mock-eleve.svg",
    alt: "impots",
    eidas: 3,
    featureHandlers: {
      coreVerify: "core-fcp-default-verify",
      authenticationEmail: "core-fcp-send-email",
      idpIdentityCheck: "core-fcp-default-identity-check",
    },
    mailto: "",
    specificText: "FI désactivé mais visible",
    url: "https://fip-desactive-visible.docker.dev-franceconnect.fr/",
    statusURL: "https://fip-desactive-visible.docker.dev-franceconnect.fr/",
    authzURL:
      "https://fip-desactive-visible.docker.dev-franceconnect.fr/user/authorize",
    tokenURL:
      "https://fip-desactive-visible.docker.dev-franceconnect.fr/user/token",
    userInfoURL:
      "https://fip-desactive-visible.docker.dev-franceconnect.fr/api/user",
    discoveryUrl:
      "https://fip-desactive-visible.docker.dev-franceconnect.fr/.well-known/openid-configuration",
    discovery: true,
    clientID: "myclientidforfip-desactive-visible",
    client_secret:
      "jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE",
    order: null,
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    endSessionURL:
      "https://fip-desactive-visible.docker.dev-franceconnect.fr/user/session/end",
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
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/oidc-callback/fip-desactive-visible",
    ],
    post_logout_redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/logout/redirect-from-idp",
    ],
  },

  // -- FIP - FIP4V2 - Deactivated and invisible
  FIP4V2: {
    uid: "fip4v2",
    name: "fip-desactive-invisible",
    active: false,
    display: false,
    title: "FI désactivé et invisible",
    image: "fi-mock-eleve.svg",
    imageFocus: "fi-mock-eleve.svg",
    alt: "impots",
    eidas: 3,
    featureHandlers: {
      coreVerify: "core-fcp-default-verify",
      authenticationEmail: "core-fcp-send-email",
      idpIdentityCheck: "core-fcp-default-identity-check",
    },
    mailto: "",
    specificText: "specific text FI 3",
    url: "https://fip2v2.docker.dev-franceconnect.fr/",
    statusURL: "https://fip2v2.docker.dev-franceconnect.fr/",
    authzURL: "https://fip2v2.docker.dev-franceconnect.fr/user/authorize",
    tokenURL: "https://fip2v2.docker.dev-franceconnect.fr/user/token",
    userInfoURL: "https://fip2v2.docker.dev-franceconnect.fr/api/user",
    discoveryUrl:
      "https://fip2v2.docker.dev-franceconnect.fr/.well-known/openid-configuration",
    discovery: true,
    clientID: "myclientidforfip4v2",
    client_secret:
      "jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE",
    order: null,
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    endSessionURL:
      "https://fip2v2.docker.dev-franceconnect.fr/user/session/end",
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
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/oidc-callback/fip4v2",
    ],
    post_logout_redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/logout/redirect-from-idp",
    ],
  },

  // -- FIP - FIP5V2 - Activated and invisible
  FIP5V2: {
    uid: "fip-active-invisible",
    name: "fip-active-invisible",
    active: true,
    display: false,
    title: "FI activé et invisible",
    image: "fi-mock-eleve.svg",
    imageFocus: "fi-mock-eleve.svg",
    alt: "impots",
    eidas: 3,
    featureHandlers: {
      coreVerify: "core-fcp-default-verify",
      authenticationEmail: "core-fcp-send-email",
      idpIdentityCheck: "core-fcp-default-identity-check",
    },
    mailto: "",
    specificText: "specific text FI 3",
    url: "https://fip2v2.docker.dev-franceconnect.fr/",
    statusURL: "https://fip2v2.docker.dev-franceconnect.fr/",
    authzURL: "https://fip2v2.docker.dev-franceconnect.fr/user/authorize",
    tokenURL: "https://fip2v2.docker.dev-franceconnect.fr/user/token",
    userInfoURL: "https://fip2v2.docker.dev-franceconnect.fr/api/user",
    discoveryUrl:
      "https://fip2v2.docker.dev-franceconnect.fr/.well-known/openid-configuration",
    discovery: true,
    clientID: "myclientidforfip5v2",
    client_secret:
      "jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE",
    order: null,
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    endSessionURL:
      "https://fip2v2.docker.dev-franceconnect.fr/user/session/end",
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
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/oidc-callback/fip2v2",
    ],
    post_logout_redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/logout/redirect-from-idp",
    ],
  },

  FIP6V2: {
    uid: "fip6v2",
    name: "fip6v2",
    active: true,
    display: true,
    title: "Identity Provider - eIDAS élevé - whitelisted - nodiscov - crypt",
    image: "fi-mock-eleve.svg",
    imageFocus: "fi-mock-eleve.svg",
    alt: "impots",
    eidas: 3,
    featureHandlers: {
      coreVerify: "core-fcp-default-verify",
      authenticationEmail: "core-fcp-send-email",
      idpIdentityCheck: "core-fcp-default-identity-check",
    },
    mailto: "",
    specificText: "specific text fip6v2",
    url: "https://fip6v2.docker.dev-franceconnect.fr",
    authzURL: "https://fip6v2.docker.dev-franceconnect.fr/user/authorize",
    tokenURL: "https://fip6v2.docker.dev-franceconnect.fr/user/token",
    userInfoURL: "https://fip6v2.docker.dev-franceconnect.fr/api/user",
    statusURL: "https://fip6v2.docker.dev-franceconnect.fr/",
    jwksURL: "https://fip6v2.docker.dev-franceconnect.fr/certs",
    discoveryUrl: "",
    discovery: false,
    clientID: "69a1a257648c1742c74d6a3d84b31943",
    client_secret:
      "jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE",
    order: null,
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    endSessionURL:
      "https://fip6v2.docker.dev-franceconnect.fr/user/session/end",
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
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/oidc-callback/fip6v2",
    ],
    post_logout_redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/logout/redirect-from-idp",
    ],
  },

  // -- FIP - FIP7V2 - blacklisted
  FIP7V2: {
    uid: "fip7v2",
    name: "fip7v2",
    active: true,
    display: true,
    title: "Identity Provider - eIDAS élevé - whitelisted - discov - nocrypt",
    image: "fi-mock-eleve.svg",
    imageFocus: "fi-mock-eleve.svg",
    alt: "impots",
    eidas: 3,
    mailto: "",
    featureHandlers: {
      coreVerify: "core-fcp-default-verify",
      authenticationEmail: "core-fcp-send-email",
      idpIdentityCheck: "core-fcp-default-identity-check",
    },
    specificText: "specific text fip7v2",
    url: "https://fip7v2.docker.dev-franceconnect.fr/",
    statusURL: "https://fip7v2.docker.dev-franceconnect.fr/",
    discoveryUrl:
      "https://fip7v2.docker.dev-franceconnect.fr/.well-known/openid-configuration",
    discovery: true,
    clientID: "79a1a257648c1742c74d6a3d84b31943",
    client_secret:
      "jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE",
    order: null,
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    endSessionURL:
      "https://fip7v2.docker.dev-franceconnect.fr/user/session/end",
    response_types: ["code"],
    id_token_signed_response_alg: "HS256",
    token_endpoint_auth_method: "client_secret_post",
    revocation_endpoint_auth_method: "client_secret_post",
    id_token_encrypted_response_alg: "",
    id_token_encrypted_response_enc: "",
    userinfo_signed_response_alg: "HS256",
    userinfo_encrypted_response_alg: "",
    userinfo_encrypted_response_enc: "",
    redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/oidc-callback/fip7v2",
    ],
    post_logout_redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/logout/redirect-from-idp",
    ],
  },

  // -- FIPEIDAS - FIPEIDASV2 - Activated
  EIDASBRIDGE: {
    uid: "eidas-bridge",
    name: "eidas-bridge",
    active: true,
    display: true,
    title: "eIDAS Identity Provider",
    image: "fi-mock-eleve.svg",
    imageFocus: "fi-mock-eleve.svg",
    alt: "eIDAS",
    eidas: 3,
    featureHandlers: {
      coreVerify: "core-fcp-eidas-verify",
      authenticationEmail: null,
      idpIdentityCheck: "core-fcp-eidas-identity-check",
    },
    mailto: "",
    specificText: "specific text eidas-bridge",
    url: "https://eidas-bridge.docker.dev-franceconnect.fr/",
    statusURL: "https://eidas-bridge.docker.dev-franceconnect.fr/",
    authzURL: "https://eidas-bridge.docker.dev-franceconnect.fr/authorize",
    tokenURL: "https://eidas-bridge.docker.dev-franceconnect.fr/token",
    userInfoURL: "https://eidas-bridge.docker.dev-franceconnect.fr/userinfo",
    discoveryUrl:
      "https://eidas-bridge.docker.dev-franceconnect.fr/.well-known/openid-configuration",
    discovery: true,
    clientID: "myclientidforeidas-bridge",
    client_secret:
      "jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE",
    order: null,
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    endSessionURL:
      "https://eidas-bridge.docker.dev-franceconnect.fr/session/end",
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
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/oidc-callback/eidas-bridge",
    ],
    post_logout_redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/logout/redirect-from-idp",
    ],
  },
};

// == FS
const fsp = {
  // -- FSP - FSP1v2 - Activated
  FSP1V2: {
    name: "FSP - FSP1v2",
    title: "FSP - FSP1v2 title",
    site: "https://site.com",
    redirect_uris: [
      "https://fsp1v2.docker.dev-franceconnect.fr/oidc-callback/envIssuer",
      // "https://fsp1v2.docker.dev-franceconnect.fr/data-callback",
    ],
    post_logout_redirect_uris: [
      "https://fsp1v2.docker.dev-franceconnect.fr/logout-callback",
    ],
    client_secret:
      "+sqGL4XE6aqzIMOp/DKC1jWB8I+8qE1jW6iz2tUv8lt+ZZzxjyoCBQeuAcJTFZxfLywkn6cAICK5JPLxYM0+8pk/q7CGHUfr/gzr3ZYRroWWE+egEEDxqRYDYe0=",
    key: "6925fb8143c76eded44d32b40c0cb1006065f7f003de52712b78985704f39950",
    entityId:
      "a0cd64372db6ecf39c317c0c74ce90f02d8ad7d510ce054883b759d666a996bc",
    credentialsFlow: false,
    featureHandlers: { none: "" },
    email: "fsp1@franceconnect.loc",
    IPServerAddressesAndRanges: ["1.1.1.1"],
    active: true,
    type: "public",
    __v: 4,
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    scopes: [
      "openid",
      "given_name",
      "family_name",
      "birthdate",
      "gender",
      "birthplace",
      "birthcountry",
      "email",
      "preferred_username",
      "address",
      "phone",
      "profile",
      "birth",
      "identite_pivot",
    ],
    id_token_signed_response_alg: "ES256",
    id_token_encrypted_response_alg: "RSA-OAEP",
    id_token_encrypted_response_enc: "A256GCM",
    userinfo_signed_response_alg: "ES256",
    userinfo_encrypted_response_alg: "RSA-OAEP",
    userinfo_encrypted_response_enc: "A256GCM",
    jwks_uri:
      "https://fsp1v2.docker.dev-franceconnect.fr/client/.well-known/keys",
    idpFilterExclude: false,
    idpFilterList: [
      "fip1v2",
      "fip2v2",
      "fip3v2",
      "fip-desactive-visible",
      "eidas-bridge",
      "fip6v2",
      "fip7v2",
      "idp-test-update",
    ],
    eidas: 2,
    identityConsent: false,
    trustedIdentity: false,
  },

  // -- FSP - FSP2v2 - Activated
  FSP2V2: {
    name: "FSP - FSP2v2",
    title: "FSP - FSP2v2 Title",
    site: "https://site.com",
    redirect_uris: [
      "https://fsp2v2.docker.dev-franceconnect.fr/oidc-callback/envIssuer",
    ],
    post_logout_redirect_uris: [
      "https://fsp2v2.docker.dev-franceconnect.fr/logout-callback",
    ],
    client_secret:
      "+sqGL4XE6aqzIMOp/DKC1jWB8I+8qE1jW6iz2tUv8lt+ZZzxjyoCBQeuAcJTFZxfLywkn6cAICK5JPLxYM0+8pk/q7CGHUfr/gzr3ZYRroWWE+egEEDxqRYDYe0=",
    key: "7a79e45107f9ccc6a3a5971d501220dc4fd9e87bb5e3fc62ce4104c756e22775",
    entityId:
      "a0cd64372db6ecf39c317c0c74ce90f02d8ad7d510ce054883b759d666a996bc",
    credentialsFlow: false,
    email: "fsp2@franceconnect.loc",
    IPServerAddressesAndRanges: ["1.1.1.1"],
    active: true,
    featureHandlers: { none: "" },
    type: "public",
    __v: 4,
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    scopes: [
      "openid",
      "given_name",
      "family_name",
      "birthdate",
      "gender",
      "birthplace",
      "birthcountry",
      "email",
      "preferred_username",
      "address",
      "phone",
      "profile",
      "birth",
      "identite_pivot",
    ],
    id_token_signed_response_alg: "ES256",
    id_token_encrypted_response_alg: "RSA-OAEP",
    id_token_encrypted_response_enc: "A256GCM",
    userinfo_signed_response_alg: "ES256",
    userinfo_encrypted_response_alg: "RSA-OAEP",
    userinfo_encrypted_response_enc: "A256GCM",
    jwks_uri:
      "https://fsp2v2.docker.dev-franceconnect.fr/client/.well-known/keys",
    idpFilterExclude: true,
    idpFilterList: ["fip7v2"],
    eidas: 2,
    identityConsent: false,
    trustedIdentity: false,
  },

  // -- FSP - FSP3v2 - Deactivated
  FSP3V2: {
    name: "Service Provider Example 3 deactivated",
    title: "Service Provider Example 3 deactivated Title",
    site: "https://site.com",
    redirect_uris: [
      "https://fsp3v2.docker.dev-franceconnect.fr/oidc-callback/envIssuer",
    ],
    post_logout_redirect_uris: [
      "https://fsp3v2.docker.dev-franceconnect.fr/logout-callback",
    ],
    client_secret:
      "+sqGL4XE6aqzIMOp/DKC1jWB8I+8qE1jW6iz2tUv8lt+ZZzxjyoCBQeuAcJTFZxfLywkn6cAICK5JPLxYM0+8pk/q7CGHUfr/gzr3ZYRroWWE+egEEDxqRYDYe0=",
    key: "my-service-provider-deactivated",
    entityId: "eae74592cc68b8451d2621035b30dbf1",
    credentialsFlow: false,
    email: "fsp3@franceconnect.loc",
    IPServerAddressesAndRanges: ["1.1.1.1"],
    active: false,
    featureHandlers: { none: "" },
    type: "public",
    __v: 4,
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    scopes: [
      "openid",
      "given_name",
      "family_name",
      "birthdate",
      "gender",
      "birthplace",
      "birthcountry",
      "email",
      "preferred_username",
      "address",
      "phone",
      "profile",
      "birth",
      "identite_pivot",
    ],
    id_token_signed_response_alg: "ES256",
    id_token_encrypted_response_alg: "RSA-OAEP",
    id_token_encrypted_response_enc: "A256GCM",
    userinfo_signed_response_alg: "ES256",
    userinfo_encrypted_response_alg: "RSA-OAEP",
    userinfo_encrypted_response_enc: "A256GCM",
    jwks_uri:
      "https://fsp3v2.docker.dev-franceconnect.fr/client/.well-known/keys",
    idpFilterExclude: true,
    idpFilterList: ["fip1v2", "fip2v2", "eidas-bridge", "fip6v2"],
    identityConsent: false,
  },

  // -- FSP - FSP4v2 - Only openid and birthdate scopes authorized
  FSP4V2: {
    name: "SP 4 - deactivated - Only openid and birthdate scopes authorized",
    title: "SP 4 - deactivated Title",
    site: "https://site.com",
    redirect_uris: [
      "https://fsp1v2.docker.dev-franceconnect.fr/oidc-callback/envIssuer",
    ],
    post_logout_redirect_uris: [
      "https://fsp1v2.docker.dev-franceconnect.fr/logout-callback",
    ],
    client_secret:
      "+sqGL4XE6aqzIMOp/DKC1jWB8I+8qE1jW6iz2tUv8lt+ZZzxjyoCBQeuAcJTFZxfLywkn6cAICK5JPLxYM0+8pk/q7CGHUfr/gzr3ZYRroWWE+egEEDxqRYDYe0=",
    key: "my-service-provider-only-openid-birthdate-scopes",
    entityId:
      "0ce6e606d53b94ccbb39d37d7acb26e63e6ec5b13d96f4ab8c7196c490f14520",
    credentialsFlow: false,
    email: "fsp4@franceconnect.loc",
    IPServerAddressesAndRanges: ["1.1.1.1"],
    active: true,
    type: "public",
    __v: 4,
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    scopes: ["openid", "birthdate"],
    id_token_signed_response_alg: "ES256",
    id_token_encrypted_response_alg: "RSA-OAEP",
    id_token_encrypted_response_enc: "A256GCM",
    userinfo_signed_response_alg: "ES256",
    userinfo_encrypted_response_alg: "RSA-OAEP",
    userinfo_encrypted_response_enc: "A256GCM",
    jwks_uri:
      "https://fsp1v2.docker.dev-franceconnect.fr/client/.well-known/keys",
    idpFilterExclude: true,
    idpFilterList: [],
    identityConsent: false,
  },

  // -- FSP - FSP5v2 - private FSP and identity consent required
  FSP5V2: {
    name: "FSP - FSP5v2",
    title: "FSP - FSP5v2 title",
    site: "https://site.com",
    redirect_uris: [
      "https://fsp5v2.docker.dev-franceconnect.fr/oidc-callback/envIssuer",
    ],
    post_logout_redirect_uris: [
      "https://fsp5v2.docker.dev-franceconnect.fr/logout-callback",
    ],
    client_secret:
      "+sqGL4XE6aqzIMOp/DKC1jWB8I+8qE1jW6iz2tUv8lt+ZZzxjyoCBQeuAcJTFZxfLywkn6cAICK5JPLxYM0+8pk/q7CGHUfr/gzr3ZYRroWWE+egEEDxqRYDYe0=",
    key: "6925fb8143c76eded44d32b40c0cb1006065f7f003de52712b78985704f39555",
    entityId:
      "6925fb8143c76eded44d32b40c0cb1006065f7f003de52712b78985704f39555",
    credentialsFlow: false,
    featureHandlers: { none: "" },
    email: "fsp5@franceconnect.loc",
    IPServerAddressesAndRanges: ["1.1.1.1"],
    active: true,
    type: "private",
    __v: 4,
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    scopes: [
      "openid",
      "given_name",
      "family_name",
      "birthdate",
      "gender",
      "birthplace",
      "birthcountry",
      "email",
      "preferred_username",
      "address",
      "phone",
      "profile",
      "birth",
      "identite_pivot",
    ],
    id_token_signed_response_alg: "ES256",
    id_token_encrypted_response_alg: "RSA-OAEP",
    id_token_encrypted_response_enc: "A256GCM",
    userinfo_signed_response_alg: "ES256",
    userinfo_encrypted_response_alg: "RSA-OAEP",
    userinfo_encrypted_response_enc: "A256GCM",
    jwks_uri:
      "https://fsp5v2.docker.dev-franceconnect.fr/client/.well-known/keys",
    idpFilterExclude: false,
    idpFilterList: ["fip1v2", "fip2v2", "fip3v2", "fip-desactive-visible", "eidas-bridge", "fip6v2", "fip7v2", "idp-test-update"],
    identityConsent: true,
    eidas: 2,
    trustedIdentity: false,
  },

  // -- FSP - FSP6v2 - private FSP and identity consent not required 
  FSP6V2: {
    name: "FSP - FSP6v2",
    title: "FSP - FSP6v2 title",
    site: "https://site.com",
    redirect_uris: [
      "https://fsp6v2.docker.dev-franceconnect.fr/oidc-callback/envIssuer",
    ],
    post_logout_redirect_uris: [
      "https://fsp6v2.docker.dev-franceconnect.fr/logout-callback",
    ],
    client_secret:
      "+sqGL4XE6aqzIMOp/DKC1jWB8I+8qE1jW6iz2tUv8lt+ZZzxjyoCBQeuAcJTFZxfLywkn6cAICK5JPLxYM0+8pk/q7CGHUfr/gzr3ZYRroWWE+egEEDxqRYDYe0=",
    key: "6925fb8143c76eded44d32b40c0cb1006065f7f003de52712b78985704f39666",
    entityId:
      "6925fb8143c76eded44d32b40c0cb1006065f7f003de52712b78985704f39666",
    credentialsFlow: false,
    featureHandlers: { none: "" },
    email: "fsp6@franceconnect.loc",
    IPServerAddressesAndRanges: ["1.1.1.1"],
    active: true,
    type: "private",
    __v: 4,
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    scopes: [
      "openid",
      "given_name",
      "family_name",
      "birthdate",
      "gender",
      "birthplace",
      "birthcountry",
      "email",
      "preferred_username",
      "address",
      "phone",
      "profile",
      "birth",
      "identite_pivot",
    ],
    id_token_signed_response_alg: "ES256",
    id_token_encrypted_response_alg: "RSA-OAEP",
    id_token_encrypted_response_enc: "A256GCM",
    userinfo_signed_response_alg: "ES256",
    userinfo_encrypted_response_alg: "RSA-OAEP",
    userinfo_encrypted_response_enc: "A256GCM",
    jwks_uri:
      "https://fsp6v2.docker.dev-franceconnect.fr/client/.well-known/keys",
    idpFilterExclude: false,
    idpFilterList: ["fip1v2", "fip2v2", "fip3v2", "fip-desactive-visible", "eidas-bridge", "fip6v2", "fip7v2", "idp-test-update"],
    identityConsent: false,
    eidas: 2,
    trustedIdentity: false,
  },

  // Eidas-bridge
  EIDASBRIDGE: {
    name: "Eidas bridge FS",
    title: "Eidas bridge FS Title",
    site: "https://eidas-bridge.docker.dev-franceconnect.fr",
    redirect_uris: [
      "https://eidas-bridge.docker.dev-franceconnect.fr/oidc-client/redirect-to-eidas-response-proxy",
    ],
    post_logout_redirect_uris: [
      "https://eidas-bridge.docker.dev-franceconnect.fr/logout-callback",
    ],
    client_secret:
      "+sqGL4XE6aqzIMOp/DKC1jWB8I+8qE1jW6iz2tUv8lt+ZZzxjyoCBQeuAcJTFZxfLywkn6cAICK5JPLxYM0+8pk/q7CGHUfr/gzr3ZYRroWWE+egEEDxqRYDYe0=",
    key: "6927fb8143c76eded44d32b40c0cb1006065f7f003de52712b78985704f39950",
    entityId: "ec8d3e2cb5ba0a7bb37b548dbaab36fc",
    credentialsFlow: false,
    email: "eidas@franceconnect.loc",
    IPServerAddressesAndRanges: ["1.1.1.1"],
    active: true,
    featureHandlers: { none: "" },
    type: "public",
    __v: 4,
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    scopes: [
      "openid",
      "gender",
      "birthdate",
      "birthcountry",
      "birthplace",
      "given_name",
      "family_name",
      "email",
      "preferred_username",
      "address",
    ],
    id_token_signed_response_alg: "ES256",
    id_token_encrypted_response_alg: "RSA-OAEP",
    id_token_encrypted_response_enc: "A256GCM",
    userinfo_signed_response_alg: "ES256",
    userinfo_encrypted_response_alg: "RSA-OAEP",
    userinfo_encrypted_response_enc: "A256GCM",
    jwks_uri:
      "https://eidas-bridge.docker.dev-franceconnect.fr/client/.well-known/keys",
    idpFilterExclude: true,
    idpFilterList: ["fip6v2", "fip7v2"],
    identityConsent: false,
  },
};

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
        sub:
          "4d46585fce406a96d97cbdc7a3983aa286c85042b3276e3c09bf848c3cfc916dv1",
        clientId:
          "a0cd64372db6ecf39c317c0c74ce90f02d8ad7d510ce054883b759d666a996bc",
      },
    ],
    federationKeys: [
      {
        clientId: "fip1v2",
        sub: "fim55",
        matchRNIPP: false,
      },
    ],
    __v: 1,
    noDisplayConfirmation: false,
  },
};
// ===============================================================

db = db.getSiblingDB("core-fcp-high");
db.auth("fc", "pass");

print("Initializing App Configuration");

// -- FSs ----------
Object.values(fsp).forEach((fs) => {
  print(`${fs.name} > Initializing provider: ${fs.name}`);
  db.client.update({ name: fs.name }, fs, { upsert: true });
});


// -- FIs ----------

Object.values(fip).forEach((fi) => {
  print(`FIP > Initializing provider: ${fi.name} - Activated`);
  db.provider.update({ uid: fi.uid }, fi, { upsert: true });
});

// -- ACCOUNTS -----
print("Initializing user account: E000001...");
db.account.update({ id: "E000001" }, accounts.E000001, { upsert: true });

print("All collections were initialized!");
