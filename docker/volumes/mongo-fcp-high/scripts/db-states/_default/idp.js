// == FI
const fip = {
  // -- FIP - FIP2-HIGH - Activated
  "FIP1-HIGH": {
    uid: "fip1-high",
    url: "https://fip1-high.docker.dev-franceconnect.fr",
    name: "fip1-high",
    image: "demonstration_eleve.png",
    title: "IDP1 - Identity Provider - eIDAS élevé - nodiscov - crypt",
    active: true,
    display: true,
    featureHandlers: {
      coreVerify: "core-fcp-default-verify",
      authenticationEmail: "core-fcp-send-email",
      idpIdentityCheck: "core-fcp-default-identity-check",
    },
    clientID: "09a1a257648c1742c74d6a3d84b31943",
    client_secret:
      "jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE",
    redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/oidc-callback/fip1-high",
    ],
    post_logout_redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/logout/redirect-from-idp",
    ],
    response_types: ["code"],
    revocation_endpoint_auth_method: "client_secret_post",
    discovery: false,
    authzURL: "https://fip1-high.docker.dev-franceconnect.fr/user/authorize",
    tokenURL: "https://fip1-high.docker.dev-franceconnect.fr/user/token",
    userInfoURL: "https://fip1-high.docker.dev-franceconnect.fr/api/user",
    userinfo_signed_response_alg: "HS256",
    userinfo_encrypted_response_alg: "RSA-OAEP",
    userinfo_encrypted_response_enc: "A256GCM",
    id_token_signed_response_alg: "HS256",
    id_token_encrypted_response_alg: "RSA-OAEP",
    id_token_encrypted_response_enc: "A256GCM",
    token_endpoint_auth_method: "client_secret_post",

    // metadata
    imageFocus: "demonstration_eleve_hover.png",
    alt: "impots",
    eidas: 3,
    mailto: "",
    specificText: "specific text fip1-high",
    order: null,
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    endSessionURL:
      "https://fip1-high.docker.dev-franceconnect.fr/user/session/end",
    statusURL: "https://fip1-high.docker.dev-franceconnect.fr/",
  },

  // -- FIP - FIP2V2 - Activated
  "FIP2-HIGH": {
    uid: "fip2-high",
    url: "https://fip2-high.docker.dev-franceconnect.fr",
    name: "fip2-high",
    image: "demonstration_eleve.png",
    title: "IDP2 - Identity Provider - eIDAS élevé - nodiscov - nocrypt",
    active: true,
    display: true,
    featureHandlers: {
      coreVerify: "core-fcp-default-verify",
      authenticationEmail: "core-fcp-send-email",
      idpIdentityCheck: "core-fcp-default-identity-check",
    },
    clientID: "myclientidforfip2-high",
    client_secret:
      "jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE",
    redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/oidc-callback/fip2-high",
    ],
    post_logout_redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/logout/redirect-from-idp",
    ],
    response_types: ["code"],
    revocation_endpoint_auth_method: "client_secret_post",
    discovery: false,
    authzURL: "https://fip2-high.docker.dev-franceconnect.fr/user/authorize",
    tokenURL: "https://fip2-high.docker.dev-franceconnect.fr/user/token",
    userInfoURL: "https://fip2-high.docker.dev-franceconnect.fr/api/user",
    userinfo_signed_response_alg: "HS256",
    userinfo_encrypted_response_alg: "",
    userinfo_encrypted_response_enc: "",
    id_token_signed_response_alg: "HS256",
    id_token_encrypted_response_alg: "",
    id_token_encrypted_response_enc: "",
    token_endpoint_auth_method: "client_secret_post",

    // metadata
    imageFocus: "demonstration_eleve_hover.png",
    alt: "impots",
    eidas: 3,
    mailto: "",
    specificText: "specific text fip1-high",
    order: null,
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    endSessionURL:
      "https://fip2-high.docker.dev-franceconnect.fr/user/session/end",
    statusURL: "https://fip2-high.docker.dev-franceconnect.fr/",
  },

  // -- FIP - FIP3V2 - Deactivated but visible
  "FIP3-HIGH": {
    uid: "fip-desactive-visible",
    url: "https://fip-desactive-visible.docker.dev-franceconnect.fr/",
    name: "fip-desactive-visible",
    image: "demonstration_eleve.png",
    title: "FIP3 - FI désactivé mais visible",
    active: false,
    display: true,
    featureHandlers: {
      coreVerify: "core-fcp-default-verify",
      authenticationEmail: "core-fcp-send-email",
      idpIdentityCheck: "core-fcp-default-identity-check",
    },
    clientID: "myclientidforfip-desactive-visible",
    client_secret:
      "jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE",
    redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/oidc-callback/fip-desactive-visible",
    ],
    post_logout_redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/logout/redirect-from-idp",
    ],
    response_types: ["code"],
    revocation_endpoint_auth_method: "client_secret_post",
    discovery: false,
    authzURL:
      "https://fip-desactive-visible.docker.dev-franceconnect.fr/user/authorize",
    tokenURL:
      "https://fip-desactive-visible.docker.dev-franceconnect.fr/user/token",
    userInfoURL:
      "https://fip-desactive-visible.docker.dev-franceconnect.fr/api/user",
    userinfo_signed_response_alg: "HS256",
    userinfo_encrypted_response_alg: "RSA-OAEP",
    userinfo_encrypted_response_enc: "A256GCM",
    id_token_signed_response_alg: "HS256",
    id_token_encrypted_response_alg: "RSA-OAEP",
    id_token_encrypted_response_enc: "A256GCM",
    token_endpoint_auth_method: "client_secret_post",

    // metadata
    imageFocus: "demonstration_eleve_hover.png",
    alt: "impots",
    eidas: 3,
    mailto: "",
    specificText: "specific text fip1-high",
    order: null,
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    endSessionURL:
      "https://fip-desactive-visible.docker.dev-franceconnect.fr/user/session/end",
    statusURL: "https://fip-desactive-visible.docker.dev-franceconnect.fr/",
  },

  // -- FIP - FIP4V2 - Deactivated and invisible
  // use fip1 urls to avoid the generation of a container
  "FIP4-HIGH": {
    uid: "fip4-high",
    url: "https://fip1-high.docker.dev-franceconnect.fr/",
    name: "fip-desactive-invisible",
    image: "demonstration_eleve.png",
    title: "FIP4 - FI désactivé et invisible",
    active: false,
    display: false,
    featureHandlers: {
      coreVerify: "core-fcp-default-verify",
      authenticationEmail: "core-fcp-send-email",
      idpIdentityCheck: "core-fcp-default-identity-check",
    },
    clientID: "myclientidforfip4-high",
    client_secret:
      "jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE",
    redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/oidc-callback/fip4-high",
    ],
    post_logout_redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/logout/redirect-from-idp",
    ],
    response_types: ["code"],
    revocation_endpoint_auth_method: "client_secret_post",
    discovery: false,
    authzURL: "https://fip1-high.docker.dev-franceconnect.fr/user/authorize",
    tokenURL: "https://fip1-high.docker.dev-franceconnect.fr/user/token",
    userInfoURL: "https://fip1-high.docker.dev-franceconnect.fr/api/user",
    userinfo_signed_response_alg: "HS256",
    userinfo_encrypted_response_alg: "RSA-OAEP",
    userinfo_encrypted_response_enc: "A256GCM",
    id_token_signed_response_alg: "HS256",
    id_token_encrypted_response_alg: "RSA-OAEP",
    id_token_encrypted_response_enc: "A256GCM",
    token_endpoint_auth_method: "client_secret_post",

    // metadata
    imageFocus: "demonstration_eleve_hover.png",
    alt: "impots",
    eidas: 3,
    mailto: "",
    specificText: "specific text fip4-high",
    order: null,
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    endSessionURL:
      "https://fip1-high.docker.dev-franceconnect.fr/user/session/end",
    statusURL: "https://fip1-high.docker.dev-franceconnect.fr/",
  },

  // -- FIP - FIP5V2 - Activated and invisible
  // use fip1 urls to avoid the generation of a container
  "FIP5-HIGH": {
    uid: "fip-active-invisible",
    url: "https://fip1-high.docker.dev-franceconnect.fr/",
    name: "fip-active-invisible",
    image: "demonstration_eleve.png",
    title: "FIP5 - FI activé et invisible",
    active: true,
    display: false,
    featureHandlers: {
      coreVerify: "core-fcp-default-verify",
      authenticationEmail: "core-fcp-send-email",
      idpIdentityCheck: "core-fcp-default-identity-check",
    },
    clientID: "myclientidforfip5-high",
    client_secret:
      "jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE",
    redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/oidc-callback/fip1-high",
    ],
    post_logout_redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/logout/redirect-from-idp",
    ],
    response_types: ["code"],
    revocation_endpoint_auth_method: "client_secret_post",
    discovery: false,
    authzURL: "https://fip1-high.docker.dev-franceconnect.fr/user/authorize",
    tokenURL: "https://fip1-high.docker.dev-franceconnect.fr/user/token",
    userInfoURL: "https://fip1-high.docker.dev-franceconnect.fr/api/user",
    userinfo_signed_response_alg: "HS256",
    userinfo_encrypted_response_alg: "RSA-OAEP",
    userinfo_encrypted_response_enc: "A256GCM",
    id_token_signed_response_alg: "HS256",
    id_token_encrypted_response_alg: "RSA-OAEP",
    id_token_encrypted_response_enc: "A256GCM",
    token_endpoint_auth_method: "client_secret_post",

    // metadata
    imageFocus: "demonstration_eleve_hover.png",
    alt: "impots",
    eidas: 3,
    mailto: "",
    specificText: "specific text fip5-high",
    order: null,
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    endSessionURL:
      "https://fip1-high.docker.dev-franceconnect.fr/user/session/end",
    statusURL: "https://fip1-high.docker.dev-franceconnect.fr/",
  },

  "FIP6-HIGH": {
    uid: "fip6-high",
    url: "https://fip6-high.docker.dev-franceconnect.fr",
    name: "fip6-high",
    image: "demonstration_eleve.png",
    title:
      "IDP6 - Identity Provider - eIDAS élevé - whitelisted - nodiscov - crypt",
    active: true,
    display: true,
    featureHandlers: {
      coreVerify: "core-fcp-default-verify",
      authenticationEmail: "core-fcp-send-email",
      idpIdentityCheck: "core-fcp-default-identity-check",
    },
    clientID: "69a1a257648c1742c74d6a3d84b31943",
    client_secret:
      "jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE",
    redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/oidc-callback/fip6-high",
    ],
    post_logout_redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/logout/redirect-from-idp",
    ],
    response_types: ["code"],
    revocation_endpoint_auth_method: "client_secret_post",
    discovery: false,
    authzURL: "https://fip6-high.docker.dev-franceconnect.fr/user/authorize",
    tokenURL: "https://fip6-high.docker.dev-franceconnect.fr/user/token",
    userInfoURL: "https://fip6-high.docker.dev-franceconnect.fr/api/user",
    userinfo_signed_response_alg: "HS256",
    userinfo_encrypted_response_alg: "RSA-OAEP",
    userinfo_encrypted_response_enc: "A256GCM",
    id_token_signed_response_alg: "HS256",
    id_token_encrypted_response_alg: "RSA-OAEP",
    id_token_encrypted_response_enc: "A256GCM",
    token_endpoint_auth_method: "client_secret_post",

    // metadata
    imageFocus: "demonstration_eleve_hover.png",
    alt: "impots",
    eidas: 3,
    mailto: "",
    specificText: "specific text fip6-high",
    order: null,
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    endSessionURL:
      "https://fip6-high.docker.dev-franceconnect.fr/user/session/end",
    statusURL: "https://fip6-high.docker.dev-franceconnect.fr/",
  },

  // -- FIP - FIP7V2 - blacklisted
  // use fip1 urls to avoid the generation of a container
  "FIP7-HIGH": {
    uid: "fip7-high",
    url: "https://fip1-high.docker.dev-franceconnect.fr/",
    name: "fip7-high",
    image: "demonstration_eleve.png",
    title:
      "IDP7 - Identity Provider - eIDAS élevé - whitelisted - discov - nocrypt",
    active: true,
    display: true,
    featureHandlers: {
      coreVerify: "core-fcp-default-verify",
      authenticationEmail: "core-fcp-send-email",
      idpIdentityCheck: "core-fcp-default-identity-check",
    },
    clientID: "79a1a257648c1742c74d6a3d84b31943",
    client_secret:
      "jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE",
    redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/oidc-callback/fip1-high",
    ],
    post_logout_redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/logout/redirect-from-idp",
    ],
    response_types: ["code"],
    revocation_endpoint_auth_method: "client_secret_post",
    statusURL: "https://fip1-high.docker.dev-franceconnect.fr/",
    discoveryUrl:
      "https://fip1-high.docker.dev-franceconnect.fr/.well-known/openid-configuration",
    userinfo_signed_response_alg: "HS256",
    userinfo_encrypted_response_alg: "",
    userinfo_encrypted_response_enc: "",
    id_token_signed_response_alg: "HS256",
    id_token_encrypted_response_alg: "",
    id_token_encrypted_response_enc: "",
    token_endpoint_auth_method: "client_secret_post",
    // metadata
    imageFocus: "demonstration_eleve_hover.png",
    alt: "impots",
    eidas: 3,
    mailto: "",
    specificText: "specific text fip7-high",
    order: null,
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    endSessionURL:
      "https://fip1-high.docker.dev-franceconnect.fr/user/session/end",
    statusURL: "https://fip1-high.docker.dev-franceconnect.fr/",
  },

  // -- FIP - FIP8V2
  // use fip1 urls to avoid the generation of a container
  "FIP8-HIGH": {
    uid: "fip8-high",
    url: "https://fip1-high.docker.dev-franceconnect.fr",
    name: "fip8-high",
    image: "demonstration_eleve.png",
    title:
      "IDP8 - Identity Provider - eIDAS élevé - whitelisted - discov - crypt",
    active: true,
    display: true,
    featureHandlers: {
      coreVerify: "core-fcp-default-verify",
      authenticationEmail: "core-fcp-send-email",
      idpIdentityCheck: "core-fcp-default-identity-check",
    },
    clientID: "09a1a257648c1742c74d6a3d84b31943",
    client_secret:
      "jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE",
    redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/oidc-callback/fip1-high",
    ],
    post_logout_redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/logout/redirect-from-idp",
    ],
    response_types: ["code"],
    revocation_endpoint_auth_method: "client_secret_post",
    discovery: true,
    discoveryUrl:
      "https://fip1-high.docker.dev-franceconnect.fr/.well-known/openid-configuration",
    userinfo_signed_response_alg: "HS256",
    userinfo_encrypted_response_alg: "RSA-OAEP",
    userinfo_encrypted_response_enc: "A256GCM",
    id_token_signed_response_alg: "HS256",
    id_token_encrypted_response_alg: "RSA-OAEP",
    id_token_encrypted_response_enc: "A256GCM",
    token_endpoint_auth_method: "client_secret_post",

    // metadata
    imageFocus: "demonstration_eleve_hover.png",
    alt: "impots",
    eidas: 3,
    mailto: "",
    specificText: "specific text fip8-high",
    order: null,
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    endSessionURL:
      "https://fip1-high.docker.dev-franceconnect.fr/user/session/end",
    statusURL: "https://fip1-high.docker.dev-franceconnect.fr/",
  },

  // -- FIP - FIP9V2
  // use fip1 urls to avoid the generation of a container
  "FIP9-HIGH": {
    uid: "fip9-high",
    url: "https://fip1-high.docker.dev-franceconnect.fr",
    name: "fip9-high",
    image: "demonstration_eleve.png",
    title:
      "IDP9 - Identity Provider - eIDAS élevé - whitelisted - discov - crypt",
    active: true,
    display: true,
    featureHandlers: {
      coreVerify: "core-fcp-default-verify",
      authenticationEmail: "core-fcp-send-email",
      idpIdentityCheck: "core-fcp-default-identity-check",
    },
    clientID: "09a1a257648c1742c74d6a3d84b31943",
    client_secret:
      "jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE",
    redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/oidc-callback/fip1-high",
    ],
    post_logout_redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/logout/redirect-from-idp",
    ],
    response_types: ["code"],
    revocation_endpoint_auth_method: "client_secret_post",
    discovery: true,
    userinfo_signed_response_alg: "HS256",
    userinfo_encrypted_response_alg: "RSA-OAEP",
    userinfo_encrypted_response_enc: "A256GCM",
    id_token_signed_response_alg: "HS256",
    id_token_encrypted_response_alg: "RSA-OAEP",
    id_token_encrypted_response_enc: "A256GCM",
    token_endpoint_auth_method: "client_secret_post",
    // metadata
    imageFocus: "demonstration_eleve_hover.png",
    alt: "impots",
    eidas: 3,
    mailto: "",
    specificText: "specific text fip9-high",
    order: null,
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    endSessionURL:
      "https://fip1-high.docker.dev-franceconnect.fr/user/session/end",
    statusURL: "https://fip1-high.docker.dev-franceconnect.fr/",
  },

  // -- FIP - FIP10V2
  // use fip1 urls to avoid the generation of a container
  "FIP10-HIGH": {
    uid: "fip10-high",
    url: "https://fip1-high.docker.dev-franceconnect.fr",
    name: "fip10-high",
    image: "demonstration_eleve.png",
    title:
      "IDP10 - Identity Provider - eIDAS élevé - whitelisted - discov - crypt",
    active: true,
    display: true,
    featureHandlers: {
      coreVerify: "core-fcp-default-verify",
      authenticationEmail: "core-fcp-send-email",
      idpIdentityCheck: "core-fcp-default-identity-check",
    },
    clientID: "09a1a257648c1742c74d6a3d84b31943",
    client_secret:
      "jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE",
    redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/oidc-callback/fip1-high",
    ],
    post_logout_redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/logout/redirect-from-idp",
    ],
    response_types: ["code"],
    revocation_endpoint_auth_method: "client_secret_post",
    discovery: true,
    discoveryUrl:
      "https://fip1-high.docker.dev-franceconnect.fr/.well-known/openid-configuration",
    // Invalid parameter when using discovery, for testing purpose
    authzURL: "https://fip1-high.docker.dev-franceconnect.fr/user/authorize",
    userinfo_signed_response_alg: "RS256",
    userinfo_encrypted_response_alg: "RSA-OAEP",
    userinfo_encrypted_response_enc: "A256GCM",
    id_token_signed_response_alg: "RS256",
    id_token_encrypted_response_alg: "RSA-OAEP",
    id_token_encrypted_response_enc: "A256GCM",
    token_endpoint_auth_method: "client_secret_post",

    // metadata
    imageFocus: "demonstration_eleve_hover.png",
    alt: "impots",
    eidas: 3,
    mailto: "",
    specificText: "specific text fip10-high",
    order: null,
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    endSessionURL:
      "https://fip1-high.docker.dev-franceconnect.fr/user/session/end",
    statusURL: "https://fip1-high.docker.dev-franceconnect.fr/",
  },

  // -- FIP - FIP11V2
  // use fip1 urls to avoid the generation of a container
  "FIP11-HIGH": {
    uid: "fip11-high",
    url: "https://fip1-high.docker.dev-franceconnect.fr",
    name: "fip11-high",
    image: "demonstration_eleve.png",
    title:
      "IDP11 - Identity Provider - eIDAS élevé - whitelisted - nodiscov - crypt",
    active: true,
    display: true,
    featureHandlers: {
      coreVerify: "core-fcp-default-verify",
      authenticationEmail: "core-fcp-send-email",
      idpIdentityCheck: "core-fcp-default-identity-check",
    },
    clientID: "09a1a257648c1742c74d6a3d84b31943",
    client_secret:
      "jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE",
    redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/oidc-callback/fip1-high",
    ],
    post_logout_redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/logout/redirect-from-idp",
    ],
    response_types: ["code"],
    revocation_endpoint_auth_method: "client_secret_post",
    discovery: false,
    jwksURL: "https://fip1-high.docker.dev-franceconnect.fr/user/jwksURL",
    authzURL: "https://fip1-high.docker.dev-franceconnect.fr/user/authorize",
    tokenURL: "https://fip1-high.docker.dev-franceconnect.fr/user/token",
    userInfoURL: "https://fip1-high.docker.dev-franceconnect.fr/api/user",
    userinfo_signed_response_alg: "RS256",
    userinfo_encrypted_response_alg: "RSA-OAEP",
    userinfo_encrypted_response_enc: "A256GCM",
    id_token_signed_response_alg: "RS256",
    id_token_encrypted_response_alg: "RSA-OAEP",
    id_token_encrypted_response_enc: "A256GCM",
    token_endpoint_auth_method: "client_secret_post",

    // metadata
    imageFocus: "demonstration_eleve_hover.png",
    alt: "impots",
    eidas: 3,
    mailto: "",
    specificText: "specific text fip11-high",
    order: null,
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    endSessionURL:
      "https://fip1-high.docker.dev-franceconnect.fr/user/session/end",
    statusURL: "https://fip1-high.docker.dev-franceconnect.fr/",
  },

  // -- FIP - FIP13V2 - Activated - eIDAS élevé - crypted (ECDH-ES + A256GCM) - signed (ES256)
  // use fip1 urls to avoid the generation of a container
  "FIP12-HIGH": {
    uid: "fip12-high",
    url: "https://fip1-high.docker.dev-franceconnect.fr",
    name: "fip12-high",
    image: "fi-mock-eleve.svg",
    title:
      "IDP12 - Identity Provider - eIDAS élevé - crypted (ECDH-ES + A256GCM) - signed (ES256)",
    active: true,
    display: true,
    featureHandlers: {
      coreVerify: "core-fcp-default-verify",
      authenticationEmail: "core-fcp-send-email",
      idpIdentityCheck: "core-fcp-default-identity-check",
    },
    clientID: "myclientidforfip13-high",
    client_secret:
      "jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE",
    redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/oidc-callback/fip1-high",
    ],
    post_logout_redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/logout/redirect-from-idp",
    ],
    response_types: ["code"],
    revocation_endpoint_auth_method: "client_secret_post",
    discovery: false,
    jwksURL: "https://fip1-high.docker.dev-franceconnect.fr/jwks",
    tokenURL: "https://fip1-high.docker.dev-franceconnect.fr/token",
    userInfoURL: "https://fip1-high.docker.dev-franceconnect.fr/userinfo",
    userinfo_signed_response_alg: "ES256",
    userinfo_encrypted_response_alg: "ECDH-ES",
    userinfo_encrypted_response_enc: "A256GCM",
    id_token_signed_response_alg: "ES256",
    id_token_encrypted_response_alg: "ECDH-ES",
    id_token_encrypted_response_enc: "A256GCM",
    token_endpoint_auth_method: "client_secret_post",

    // metadata
    imageFocus: "fi-mock-eleve.svg",
    alt: "impots",
    eidas: 3,
    mailto: "",
    specificText: "specific text fip12-high",
    order: null,
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "adémin",
    endSessionURL:
      "https://fip1-high.docker.dev-franceconnect.fr/user/session/end",
    statusURL: "https://fip1-high.docker.dev-franceconnect.fr/",
  },

  // -- FIP - FIP13V2 - Activated - eIDAS élevé - crypted (ECDH-ES + A256GCM) - signed (ES256)
  "FIP13-HIGH": {
    uid: "fip13-high",
    name: "fip13-high",
    active: true,
    display: true,
    title:
      "IDP13 - Identity Provider - eIDAS élevé - crypted (ECDH-ES + A256GCM) - signed (ES256)",
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
    specificText: "specific text fip13-high",
    url: "https://fip13-high.docker.dev-franceconnect.fr",
    tokenURL: "https://fip13-high.docker.dev-franceconnect.fr/token",
    userInfoURL: "https://fip13-high.docker.dev-franceconnect.fr/userinfo",
    endSessionURL:
      "https://fip13-high.docker.dev-franceconnect.fr/user/session/end",
    statusURL: "https://fip13-high.docker.dev-franceconnect.fr/",
    jwksURL: "https://fip13-high.docker.dev-franceconnect.fr/jwks",
    authzURL: "https://fip13-high.docker.dev-franceconnect.fr/authorize",
    discovery: false,
    response_types: ["code"],
    clientID: "myclientidforfip13-high",
    client_secret:
      "jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE",
    order: null,
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    id_token_signed_response_alg: "ES256",
    token_endpoint_auth_method: "client_secret_post",
    revocation_endpoint_auth_method: "client_secret_post",
    id_token_encrypted_response_alg: "ECDH-ES",
    id_token_encrypted_response_enc: "A256GCM",
    userinfo_signed_response_alg: "ES256",
    userinfo_encrypted_response_alg: "ECDH-ES",
    userinfo_encrypted_response_enc: "A256GCM",
    redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/oidc-callback/fip13-high",
    ],
    post_logout_redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/logout/redirect-from-idp",
    ],
  },

  // -- FIP - FIP14V2 - Activated - eIDAS élevé - crypted (RSA-OAEP + A256GCM) - signed (RS256)
  "FIP14-HIGH": {
    uid: "fip14-high",
    name: "fip14-high",
    active: true,
    display: true,
    title:
      "IDP14 - Identity Provider - eIDAS élevé - crypted (RSA-OAEP + A256GCM) - signed (RS256)",
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
    specificText: "specific text fip14-high",
    url: "https://fip14-high.docker.dev-franceconnect.fr",
    statusURL: "https://fip14-high.docker.dev-franceconnect.fr/",
    authzURL: "https://fip14-high.docker.dev-franceconnect.fr/authorize",
    tokenURL: "https://fip14-high.docker.dev-franceconnect.fr/token",
    userInfoURL: "https://fip14-high.docker.dev-franceconnect.fr/userinfo",
    endSessionURL:
      "https://fip14-high.docker.dev-franceconnect.fr/user/session/end",
    jwksURL: "https://fip14-high.docker.dev-franceconnect.fr/jwks",
    discovery: false,
    response_types: ["code"],
    clientID: "myclientidforfip14-high",
    client_secret:
      "jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE",
    order: null,
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    id_token_signed_response_alg: "RS256",
    token_endpoint_auth_method: "client_secret_post",
    revocation_endpoint_auth_method: "client_secret_post",
    id_token_encrypted_response_alg: "RSA-OAEP",
    id_token_encrypted_response_enc: "A256GCM",
    userinfo_signed_response_alg: "RS256",
    userinfo_encrypted_response_alg: "RSA-OAEP",
    userinfo_encrypted_response_enc: "A256GCM",
    redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/oidc-callback/fip14-high",
    ],
    post_logout_redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/logout/redirect-from-idp",
    ],
  },

  // -- FIP - FIP15V2 - Activated - eIDAS substantiel - crypted (ECDH-ES + A256GCM) - signed (ES256)
  "FIP15-HIGH": {
    uid: "fip15-high",
    name: "fip15-high",
    active: true,
    display: true,
    title:
      "IDP15 - Identity Provider - eIDAS substantiel - crypted (ECDH-ES + A256GCM) - signed (ES256)",
    image: "fi-mock-substantiel.svg",
    imageFocus: "fi-mock-substantiel.svg",
    alt: "impots",
    eidas: 2,
    featureHandlers: {
      coreVerify: "core-fcp-default-verify",
      authenticationEmail: "core-fcp-send-email",
      idpIdentityCheck: "core-fcp-default-identity-check",
    },
    mailto: "",
    specificText: "specific text fip15-high",
    url: "https://fip15-high.docker.dev-franceconnect.fr",
    statusURL: "https://fip15-high.docker.dev-franceconnect.fr/",
    authzURL: "https://fip15-high.docker.dev-franceconnect.fr/authorize",
    tokenURL: "https://fip15-high.docker.dev-franceconnect.fr/token",
    userInfoURL: "https://fip15-high.docker.dev-franceconnect.fr/userinfo",
    endSessionURL:
      "https://fip15-high.docker.dev-franceconnect.fr/user/session/end",
    jwksURL: "https://fip15-high.docker.dev-franceconnect.fr/jwks",
    discovery: false,
    response_types: ["code"],
    clientID: "myclientidforfip15-high",
    client_secret:
      "jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE",
    order: null,
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    endSessionURL:
      "https://fip15-high.docker.dev-franceconnect.fr/user/session/end",
    id_token_signed_response_alg: "ES256",
    token_endpoint_auth_method: "client_secret_post",
    revocation_endpoint_auth_method: "client_secret_post",
    id_token_encrypted_response_alg: "ECDH-ES",
    id_token_encrypted_response_enc: "A256GCM",
    userinfo_signed_response_alg: "ES256",
    userinfo_encrypted_response_alg: "ECDH-ES",
    userinfo_encrypted_response_enc: "A256GCM",
    redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/oidc-callback/fip15-high",
    ],
    post_logout_redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/logout/redirect-from-idp",
    ],
  },

  // -- FIP - FIP16V2 - Activated - eIDAS substantiel - crypted (RSA-OAEP + A256GCM) - signed (RS256)
  "FIP16-HIGH": {
    uid: "fip16-high",
    name: "fip16-high",
    active: true,
    display: true,
    title:
      "IDP16 - Identity Provider - eIDAS substantiel - crypted (RSA-OAEP + A256GCM) - signed (RS256)",
    image: "fi-mock-substantiel.svg",
    imageFocus: "fi-mock-substantiel.svg",
    alt: "impots",
    eidas: 2,
    featureHandlers: {
      coreVerify: "core-fcp-default-verify",
      authenticationEmail: "core-fcp-send-email",
      idpIdentityCheck: "core-fcp-default-identity-check",
    },
    mailto: "",
    specificText: "specific text fip16-high",
    url: "https://fip16-high.docker.dev-franceconnect.fr",
    statusURL: "https://fip16-high.docker.dev-franceconnect.fr/",
    authzURL: "https://fip16-high.docker.dev-franceconnect.fr/authorize",
    tokenURL: "https://fip16-high.docker.dev-franceconnect.fr/token",
    userInfoURL: "https://fip16-high.docker.dev-franceconnect.fr/userinfo",
    endSessionURL:
      "https://fip16-high.docker.dev-franceconnect.fr/user/session/end",
    jwksURL: "https://fip16-high.docker.dev-franceconnect.fr/jwks",
    discovery: false,
    response_types: ["code"],
    clientID: "myclientidforfip16-high",
    client_secret:
      "jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE",
    order: null,
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    id_token_signed_response_alg: "RS256",
    token_endpoint_auth_method: "client_secret_post",
    revocation_endpoint_auth_method: "client_secret_post",
    id_token_encrypted_response_alg: "RSA-OAEP",
    id_token_encrypted_response_enc: "A256GCM",
    userinfo_signed_response_alg: "RS256",
    userinfo_encrypted_response_alg: "RSA-OAEP",
    userinfo_encrypted_response_enc: "A256GCM",
    redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/oidc-callback/fip16-high",
    ],
    post_logout_redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/logout/redirect-from-idp",
    ],
  },

  // -- FIP - FIP17V2 - Activated - eIDAS substantiel - crypted (none) - signed (ES256)
  "FIP17-HIGH": {
    uid: "fip17-high",
    name: "fip17-high",
    active: true,
    display: true,
    title:
      "IDP17 - Identity Provider - eIDAS substantiel - crypted (none) - signed (ES256)",
    image: "fi-mock-substantiel.svg",
    imageFocus: "fi-mock-substantiel.svg",
    alt: "impots",
    eidas: 2,
    featureHandlers: {
      coreVerify: "core-fcp-default-verify",
      authenticationEmail: "core-fcp-send-email",
      idpIdentityCheck: "core-fcp-default-identity-check",
    },
    mailto: "",
    specificText: "specific text fip17-high",
    url: "https://fip17-high.docker.dev-franceconnect.fr",
    authzURL: "https://fip17-high.docker.dev-franceconnect.fr/authorize",
    tokenURL: "https://fip17-high.docker.dev-franceconnect.fr/token",
    userInfoURL: "https://fip17-high.docker.dev-franceconnect.fr/userinfo",
    statusURL: "https://fip17-high.docker.dev-franceconnect.fr/",
    endSessionURL:
      "https://fip17-high.docker.dev-franceconnect.fr/user/session/end",
    jwksURL: "https://fip17-high.docker.dev-franceconnect.fr/jwks",
    discovery: false,
    response_types: ["code"],
    clientID: "myclientidforfip17-high",
    client_secret:
      "jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE",
    order: null,
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    id_token_signed_response_alg: "ES256",
    token_endpoint_auth_method: "client_secret_post",
    revocation_endpoint_auth_method: "client_secret_post",
    id_token_encrypted_response_alg: "",
    id_token_encrypted_response_enc: "",
    userinfo_signed_response_alg: "ES256",
    userinfo_encrypted_response_alg: "",
    userinfo_encrypted_response_enc: "",
    redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/oidc-callback/fip17-high",
    ],
    post_logout_redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/logout/redirect-from-idp",
    ],
  },

  // -- FIP - FIP18V2 - Activated - eIDAS faible - crypted (none) - signed (ES256)
  "FIP18-HIGH": {
    uid: "fip18-high",
    name: "fip18-high",
    active: true,
    display: true,
    title:
      "IDP18 - Identity Provider - eIDAS faible - crypted (none) - signed (ES256)",
    image: "fi-mock-faible.svg",
    imageFocus: "fi-mock-faible.svg",
    alt: "impots",
    eidas: 1,
    featureHandlers: {
      coreVerify: "core-fcp-default-verify",
      authenticationEmail: "core-fcp-send-email",
      idpIdentityCheck: "core-fcp-default-identity-check",
    },
    mailto: "",
    specificText: "specific text fip18-high",
    url: "https://fip18-high.docker.dev-franceconnect.fr",
    statusURL: "https://fip18-high.docker.dev-franceconnect.fr/",
    authzURL: "https://fip18-high.docker.dev-franceconnect.fr/authorize",
    tokenURL: "https://fip18-high.docker.dev-franceconnect.fr/token",
    userInfoURL: "https://fip18-high.docker.dev-franceconnect.fr/userinfo",
    endSessionURL:
      "https://fip18-high.docker.dev-franceconnect.fr/user/session/end",
    jwksURL: "https://fip18-high.docker.dev-franceconnect.fr/jwks",
    discovery: false,
    response_types: ["code"],
    clientID: "myclientidforfip18-high",
    client_secret:
      "jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE",
    order: null,
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    id_token_signed_response_alg: "ES256",
    token_endpoint_auth_method: "client_secret_post",
    revocation_endpoint_auth_method: "client_secret_post",
    id_token_encrypted_response_alg: "",
    id_token_encrypted_response_enc: "",
    userinfo_signed_response_alg: "ES256",
    userinfo_encrypted_response_alg: "",
    userinfo_encrypted_response_enc: "",

    redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/oidc-callback/fip18-high",
    ],
    post_logout_redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/logout/redirect-from-idp",
    ],
  },

  // -- FIP - FIP19V2 - Activated - eIDAS faible - crypted (none) - signed (RS256)
  "FIP19-HIGH": {
    uid: "fip19-high",
    name: "fip19-high",
    active: true,
    display: true,
    title:
      "IDP19 - Identity Provider - eIDAS faible - crypted (none) - signed (RS256)",
    image: "fi-mock-faible.svg",
    imageFocus: "fi-mock-faible.svg",
    alt: "impots",
    eidas: 1,
    featureHandlers: {
      coreVerify: "core-fcp-default-verify",
      authenticationEmail: "core-fcp-send-email",
      idpIdentityCheck: "core-fcp-default-identity-check",
    },
    mailto: "",
    specificText: "specific text fip19-high",
    url: "https://fip19-high.docker.dev-franceconnect.fr",
    statusURL: "https://fip19-high.docker.dev-franceconnect.fr/",
    authzURL: "https://fip19-high.docker.dev-franceconnect.fr/authorize",
    tokenURL: "https://fip19-high.docker.dev-franceconnect.fr/token",
    userInfoURL: "https://fip19-high.docker.dev-franceconnect.fr/userinfo",
    endSessionURL:
      "https://fip19-high.docker.dev-franceconnect.fr/user/session/end",
    jwksURL: "https://fip19-high.docker.dev-franceconnect.fr/jwks",
    discovery: false,
    response_types: ["code"],
    clientID: "myclientidforfip19-high",
    client_secret:
      "jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE",
    order: null,
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    id_token_signed_response_alg: "RS256",
    token_endpoint_auth_method: "client_secret_post",
    revocation_endpoint_auth_method: "client_secret_post",
    id_token_encrypted_response_alg: "",
    id_token_encrypted_response_enc: "",
    userinfo_signed_response_alg: "RS256",
    userinfo_encrypted_response_alg: "",
    userinfo_encrypted_response_enc: "",
    redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/oidc-callback/fip19-high",
    ],
    post_logout_redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/logout/redirect-from-idp",
    ],
  },

  // -- FIP - FIP20V2 - Activated - eIDAS faible - crypted (none) - signed (HS256)
  "FIP20-HIGH": {
    uid: "fip20-high",
    name: "fip20-high",
    active: true,
    display: true,
    title:
      "IDP20 - Identity Provider - eIDAS faible - crypted (none) - signed (HS256)",
    image: "fi-mock-faible.svg",
    imageFocus: "fi-mock-faible.svg",
    alt: "impots",
    eidas: 1,
    featureHandlers: {
      coreVerify: "core-fcp-default-verify",
      authenticationEmail: "core-fcp-send-email",
      idpIdentityCheck: "core-fcp-default-identity-check",
    },
    mailto: "",
    specificText: "specific text fip20-high",
    url: "https://fip20-high.docker.dev-franceconnect.fr",
    statusURL: "https://fip20-high.docker.dev-franceconnect.fr/",
    authzURL: "https://fip20-high.docker.dev-franceconnect.fr/authorize",
    tokenURL: "https://fip20-high.docker.dev-franceconnect.fr/token",
    userInfoURL: "https://fip20-high.docker.dev-franceconnect.fr/userinfo",
    endSessionURL:
      "https://fip20-high.docker.dev-franceconnect.fr/user/session/end",
    discovery: false,
    response_types: ["code"],
    clientID: "myclientidforfip20-high",
    client_secret:
      "jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE",
    order: null,
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    id_token_signed_response_alg: "HS256",
    token_endpoint_auth_method: "client_secret_post",
    revocation_endpoint_auth_method: "client_secret_post",
    id_token_encrypted_response_alg: "",
    id_token_encrypted_response_enc: "",
    userinfo_signed_response_alg: "HS256",
    userinfo_encrypted_response_alg: "",
    userinfo_encrypted_response_enc: "",
    redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/oidc-callback/fip20-high",
    ],
    post_logout_redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/logout/redirect-from-idp",
    ],
  },

  // -- FIPEIDAS - FIPEIDASV2 - Activated
  EIDASBRIDGE: {
    uid: "eidas-bridge",
    url: "https://eidas-bridge.docker.dev-franceconnect.fr",
    name: "eidas-bridge",
    image: "demonstration_eleve.png",
    title: "eIDAS Identity Provider",
    active: true,
    display: true,
    featureHandlers: {
      coreVerify: "core-fcp-eidas-verify",
      authenticationEmail: null,
      idpIdentityCheck: "core-fcp-eidas-identity-check",
    },
    clientID: "myclientidforeidas-bridge",
    client_secret:
      "jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE",
    redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/oidc-callback/eidas-bridge",
    ],
    post_logout_redirect_uris: [
      "https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/logout/redirect-from-idp",
    ],
    response_types: ["code"],
    revocation_endpoint_auth_method: "client_secret_post",
    discovery: false,
    authzURL: "https://eidas-bridge.docker.dev-franceconnect.fr/authorize",
    tokenURL: "https://eidas-bridge.docker.dev-franceconnect.fr/token",
    userInfoURL: "https://eidas-bridge.docker.dev-franceconnect.fr/userinfo",
    userinfo_signed_response_alg: "ES256",
    userinfo_encrypted_response_alg: "RSA-OAEP",
    userinfo_encrypted_response_enc: "A256GCM",
    id_token_signed_response_alg: "ES256",
    id_token_encrypted_response_alg: "RSA-OAEP",
    id_token_encrypted_response_enc: "A256GCM",
    token_endpoint_auth_method: "client_secret_post",
    jwksURL: "https://eidas-bridge.docker.dev-franceconnect.fr/jwks",

    // metadata
    imageFocus: "demonstration_eleve_hover.png",
    alt: "impots",
    eidas: 3,
    mailto: "",
    specificText: "specific text fip1-high",
    order: null,
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    endSessionURL:
      "https://eidas-bridge.docker.dev-franceconnect.fr/session/end",
    statusURL: "https://eidas-bridge.docker.dev-franceconnect.fr/",
  },
};

// -- FIs ----------

Object.values(fip).forEach((fi) => {
  print(`FIP > Initializing provider: ${fi.name} - Activated`);
  db.provider.update({ uid: fi.uid }, fi, { upsert: true });
});
