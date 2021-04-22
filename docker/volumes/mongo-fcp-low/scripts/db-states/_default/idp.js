/**
 * Average IDP with basic configuration
 */
print("Initializing fip1-low");
db.provider.replaceOne(
  {
    name: "fip1-low",
  },
  {
    uid: "fip1-low",
    name: "fip1-low",
    active: true,
    display: true,
    title: "IDP1 - LOW",
    image: "demonstration_eleve.png",
    imageFocus: "demonstration_eleve_hover.png",
    alt: "fip1-low",
    eidas: 3,
    mailto: "",
    featureHandlers: {
      coreVerify: "core-fcp-default-verify",
      authenticationEmail: "core-fcp-send-email",
      idpIdentityCheck: "core-fcp-default-identity-check",
    },
    specificText: "specific text fip1-low",
    url: "https://fip1-low.docker.dev-franceconnect.fr/",
    statusURL: "https://fip1-low.docker.dev-franceconnect.fr/",
    authzURL: "https://fip1-low.docker.dev-franceconnect.fr/user/authorize",
    tokenURL: "https://fip1-low.docker.dev-franceconnect.fr/user/token",
    userInfoURL: "https://fip1-low.docker.dev-franceconnect.fr/api/user",
    discoveryUrl:
      "https://fip1-low.docker.dev-franceconnect.fr/.well-known/openid-configuration",
    discovery: true,
    clientID: "myclientidforfip1-low",
    client_secret:
      "jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE",
    order: null,
    updatedAt: new Date("2019-04-24 17:09:17"),
    updatedBy: "admin",
    endSessionURL:
      "https://fip1-low.docker.dev-franceconnect.fr/user/session/end",
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
      "https://core-fcp-low.docker.dev-franceconnect.fr/api/v2/oidc-callback/fip1-low",
    ],
    post_logout_redirect_uris: [
      "https://core-fcp-low.docker.dev-franceconnect.fr/api/v2/logout/redirect-from-idp",
    ],
  },
  { upsert: true }
);

/* ------------------------------------------------------------------------------- */
