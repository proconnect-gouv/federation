const fia = {
  // -- FIA - FIA1-LOW - Activated
  'FIA1-LOW': {
    uid: '9c716f61-b8a1-435c-a407-ef4d677ec270',
    name: 'fia1-low',
    siret: '81801912700021',
    active: true,
    title: 'Identity Provider 1 - eIDAS faible - ES256',
    trustedIdentity: false,
    supportEmail: 'support+federation@proconnect.gouv.fr',
    url: 'https://fia1-low.docker.dev-franceconnect.fr/',
    statusURL: 'https://fia1-low.docker.dev-franceconnect.fr/',
    discoveryUrl:
      'https://fia1-low.docker.dev-franceconnect.fr/.well-known/openid-configuration',
    discovery: true,
    clientID: 'myclientidforfia1-low',
    client_secret:
      'jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE',
    updatedAt: new Date('2019-04-24 17:09:17'),
    updatedBy: 'admin',
    endSessionURL:
      'https://fia1-low.docker.dev-franceconnect.fr/user/session/end',
    id_token_signed_response_alg: 'ES256',
    token_endpoint_auth_method: 'client_secret_post',
    id_token_encrypted_response_alg: '',
    id_token_encrypted_response_enc: '',
    userinfo_signed_response_alg: 'ES256',
    userinfo_encrypted_response_alg: '',
    userinfo_encrypted_response_enc: '',
    redirect_uris: [
      'https://core-fca-low.docker.dev-franceconnect.fr/api/v2/oidc-callback',
    ],
    post_logout_redirect_uris: [
      'https://core-fca-low.docker.dev-franceconnect.fr/api/v2/client/logout-callback',
    ],
    fqdns: ['fia1.fr', 'polyfi.fr', 'polyfi2.fr', 'abcd.com'],
    isRoutingEnabled: true,
  },

  // -- FIA - FIA2-LOW - Activated No support Email
  'FIA2-LOW': {
    uid: '0e7c099f-fe86-49a0-b7d1-19df45397212',
    name: 'fia2-low',
    siret: '',
    active: true,
    title: 'Identity Provider 2 - eIDAS faible - RS256',
    trustedIdentity: false,
    supportEmail: '',
    url: 'https://fia2-low.docker.dev-franceconnect.fr/',
    statusURL: 'https://fia2-low.docker.dev-franceconnect.fr/',
    discoveryUrl:
      'https://fia2-low.docker.dev-franceconnect.fr/.well-known/openid-configuration',
    discovery: true,
    clientID: 'myclientidforfia2-low',
    client_secret:
      'jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE',
    updatedAt: new Date('2019-04-24 17:09:17'),
    updatedBy: 'admin',
    endSessionURL:
      'https://fia2-low.docker.dev-franceconnect.fr/user/session/end',
    id_token_signed_response_alg: 'RS256',
    token_endpoint_auth_method: 'client_secret_post',
    id_token_encrypted_response_alg: '',
    id_token_encrypted_response_enc: '',
    userinfo_signed_response_alg: '',
    userinfo_encrypted_response_alg: '',
    userinfo_encrypted_response_enc: '',
    redirect_uris: [
      'https://core-fca-low.docker.dev-franceconnect.fr/api/v2/oidc-callback/fia2-low',
    ],
    post_logout_redirect_uris: [
      'https://core-fca-low.docker.dev-franceconnect.fr/api/v2/client/logout-callback',
    ],
    fqdns: ['fia2.fr', 'polyfi.fr', 'polyfi2.fr'],
    isRoutingEnabled: true,
  },

  // -- Fia3-low - Deactivated
  'FIA3-LOW': {
    uid: 'b61f31b8-c131-40d0-9eca-109219249db6',
    name: 'fia3-desactive',
    siret: '12345678910007',
    active: false,
    title: 'Identity Provider 3 (désactivé)',
    trustedIdentity: false,
    supportEmail: 'support+federation@proconnect.gouv.fr',
    url: 'https://fia3-low.docker.dev-franceconnect.fr/',
    statusURL: 'https://fia3-low.docker.dev-franceconnect.fr/',
    discoveryUrl:
      'https://fia3-low.docker.dev-franceconnect.fr/.well-known/openid-configuration',
    discovery: true,
    clientID: 'myclientidforfia3-low',
    client_secret:
      'jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE',
    updatedAt: new Date('2019-04-24 17:09:17'),
    updatedBy: 'admin',
    endSessionURL:
      'https://fia3-low.docker.dev-franceconnect.fr/user/session/end',
    id_token_signed_response_alg: 'ES256',
    token_endpoint_auth_method: 'client_secret_post',
    id_token_encrypted_response_alg: '',
    id_token_encrypted_response_enc: '',
    userinfo_signed_response_alg: 'ES256',
    userinfo_encrypted_response_alg: '',
    userinfo_encrypted_response_enc: '',
    redirect_uris: [
      'https://core-fca-low.docker.dev-franceconnect.fr/api/v2/oidc-callback',
    ],
    post_logout_redirect_uris: [
      'https://core-fca-low.docker.dev-franceconnect.fr/api/v2/client/logout-callback',
    ],
    fqdns: ['fia3.fr'],
    isRoutingEnabled: true,
  },

  // -- FIA - MonComptePro - Activated
  MONCOMPTEPRO: {
    uid: '71144ab3-ee1a-4401-b7b3-79b44f7daeeb',
    name: 'moncomptepro',
    siret: '12345678910009',
    active: true,
    title: 'Identity Provider MonComptePro',
    trustedIdentity: false,
    supportEmail: 'support+federation@proconnect.gouv.fr',
    url: 'https://moncomptepro.docker.dev-franceconnect.fr',
    discoveryUrl:
      'https://moncomptepro.docker.dev-franceconnect.fr/.well-known/openid-configuration',
    discovery: true,
    clientID: 'myclientidformoncomptepro',
    client_secret:
      'jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE',
    updatedAt: new Date('2019-04-24 17:09:17'),
    updatedBy: 'admin',
    endSessionURL:
      'https://moncomptepro.docker.dev-franceconnect.fr/user/session/end',
    id_token_signed_response_alg: 'ES256',
    token_endpoint_auth_method: 'client_secret_post',
    id_token_encrypted_response_alg: '',
    id_token_encrypted_response_enc: '',
    userinfo_signed_response_alg: 'ES256',
    userinfo_encrypted_response_alg: '',
    userinfo_encrypted_response_enc: '',
    redirect_uris: [
      'https://core-fca-low.docker.dev-franceconnect.fr/api/v2/oidc-callback',
    ],
    post_logout_redirect_uris: [
      'https://core-fca-low.docker.dev-franceconnect.fr/api/v2/client/logout-callback',
    ],
    fqdns: ['moncomptepro.fr', 'polyfi.fr'],
    isRoutingEnabled: true,
  },
  // RIE

  // -- FIA - FIA-RIE-LOW - Activated
  'FIA-RIE-LOW': {
    uid: 'c6ecab5e-dc67-4390-af57-fe208e97b649',
    name: 'fia-rie-low',
    siret: '12345678910010',
    active: true,
    title: 'Identity Provider RIE - eIDAS faible - ES256',
    trustedIdentity: false,
    supportEmail: 'support+federation@proconnect.gouv.fr',
    url: 'https://fia-rie-low.docker.dev-franceconnect.fr/',
    statusURL: 'https://fia-rie-low.docker.dev-franceconnect.fr/',
    discoveryUrl:
      'https://fia-rie-low.docker.dev-franceconnect.fr/.well-known/openid-configuration',
    discovery: true,
    clientID: 'myclientidforfia-rie-low',
    client_secret:
      'jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE',
    updatedAt: new Date('2019-04-24 17:09:17'),
    updatedBy: 'admin',
    endSessionURL:
      'https://fia-rie-low.docker.dev-franceconnect.fr/user/session/end',
    id_token_signed_response_alg: 'ES256',
    token_endpoint_auth_method: 'client_secret_post',
    id_token_encrypted_response_alg: '',
    id_token_encrypted_response_enc: '',
    userinfo_signed_response_alg: 'ES256',
    userinfo_encrypted_response_alg: '',
    userinfo_encrypted_response_enc: '',
    redirect_uris: [
      'https://core-fca-low.docker.dev-franceconnect.fr/api/v2/oidc-callback',
    ],
    post_logout_redirect_uris: [
      'https://core-fca-low.docker.dev-franceconnect.fr/api/v2/client/logout-callback',
    ],
    fqdns: ['fi-rie.fr'],
    isRoutingEnabled: true,
  },

  // -- FIA using LemonLDAP
  'FIA-LLNG-LOW': {
    uid: '4be87184-1052-460b-9e14-3e164f584200',
    name: 'LemonLDAP::ng',
    siret: '12345678910011',
    active: true,
    title: 'Identity Provider LemonLDAP',
    trustedIdentity: false,
    supportEmail: 'support+federation@proconnect.gouv.fr',
    url: 'https://auth.llng.docker.dev-franceconnect.fr',
    discoveryUrl:
      'https://auth.llng.docker.dev-franceconnect.fr/.well-known/openid-configuration',
    discovery: true,
    clientID: 'myclientidforllng',
    client_secret:
      'jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE',
    updatedAt: new Date('2019-04-24 17:09:17'),
    updatedBy: 'admin',
    endSessionURL:
      'https://auth.llng.docker.dev-franceconnect.fr/oauth2/logout',
    id_token_signed_response_alg: 'RS256',
    token_endpoint_auth_method: 'client_secret_post',
    id_token_encrypted_response_alg: '',
    id_token_encrypted_response_enc: 'A256GCM',
    userinfo_signed_response_alg: 'RS256',
    userinfo_encrypted_response_alg: '',
    userinfo_encrypted_response_enc: 'RS256',
    redirect_uris: [
      'https://core-fca-low.docker.dev-franceconnect.fr/api/v2/oidc-callback/fia-llng-low',
    ],
    post_logout_redirect_uris: [
      'https://core-fca-low.docker.dev-franceconnect.fr/api/v2/client/logout-callback',
    ],
    fqdns: [],
    isRoutingEnabled: true,
  },
};

// -- Idps ----------
Object.values(fia).forEach((idp) => {
  print(`${idp.name} > Initializing provider: ${idp.name}`);
  db.provider.update({ name: idp.name }, idp, { upsert: true });
});
