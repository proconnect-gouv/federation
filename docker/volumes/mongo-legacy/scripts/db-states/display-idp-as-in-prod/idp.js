// print('Remove all idp from database');
// db.provider.remove({});

//FSP1
print('Update fsp1 whitelist idp');
db.client.update(
  {
    name: 'Service Provider Example',
  },
  {
    $set: {
      whitelistByIdentityProvider: {
        impot_gouv: true,
        ameli: true,
        la_poste: true,
        mobile_connect: true,
        msa: true,
        alicem: true,
      },
    },
  },
);

// impot_gouv
print('Initializing idp: impot_gouv...');
db.provider.update(
  {
    name: 'impot_gouv',
  },
  {
    uid: '8d449301-24fe-466e-8807-4c4ed062496e',
    name: 'impot_gouv',
    active: true,
    display: true,
    title: 'Impots.Gouv.fr',
    image: 'fi-impots.png',
    alt: '',
    eidas: 2,
    mailto: '',
    specificText: 'specific text fip3',
    url: 'https://fip3.docker.dev-franceconnect.fr/',
    statusURL: 'https://fip3.docker.dev-franceconnect.fr/status',
    authzURL: 'https://fip3.docker.dev-franceconnect.fr/user/authorize',
    tokenURL: 'https://fip3.docker.dev-franceconnect.fr/user/token',
    userInfoURL: 'https://fip3.docker.dev-franceconnect.fr/api/user',
    discoveryUrl:
      'https://fip3.docker.dev-franceconnect.fr/.well-known/openid-configuration',
    discovery: true,
    clientID: '09a1a257648c1742c74d6a3d84b',
    clientSecret: '7ae4fef2aab63fb78d777fe657b7536f654s987',
    order: 14,
    updatedAt: '2019-04-24 17:09:17',
    updatedBy: '5cd955c4ee275cd32522dc07',
    clientSecretHash:
      'bbe8f1b2a1415d6942b653689a51ba16f22b41e57a4e44b40799d66c559d2b9b7baf3dd2d9bdc7cd88b6960375862ce40171d0d9be28ee7be293067bb029d61002a0988676f1432153e708d6883c2f8046d758201775c02ef110d32d4be1430eb89db3430a4133d0909be5330e57e03044743ff530f7d040a7946b7db8ff0dad7cb1123e90d1ada397dd85a999b3013d',
  },
  {
    upsert: true,
  },
);

// ameli
print('Initializing idp: ameli...');
db.provider.update(
  {
    name: 'ameli',
  },
  {
    uid: 'f0a5094c-bdd5-4894-8ed4-33120fac8479',
    name: 'ameli',
    active: true,
    display: true,
    title: 'Ameli.fr',
    image: 'fi-ameli.png',
    alt: '',
    eidas: 2,
    mailto: '',
    specificText: 'specific text fip3',
    url: 'https://fip3.docker.dev-franceconnect.fr/',
    statusURL: 'https://fip3.docker.dev-franceconnect.fr/status',
    authzURL: 'https://fip3.docker.dev-franceconnect.fr/user/authorize',
    tokenURL: 'https://fip3.docker.dev-franceconnect.fr/user/token',
    userInfoURL: 'https://fip3.docker.dev-franceconnect.fr/api/user',
    discoveryUrl:
      'https://fip3.docker.dev-franceconnect.fr/.well-known/openid-configuration',
    discovery: true,
    clientID: '09a1a257648c1742c74d6a3d84b',
    clientSecret: '7ae4fef2aab63fb78d777fe657b7536f654s987',
    order: 15,
    updatedAt: '2019-04-24 17:09:17',
    updatedBy: '5cd955c4ee275cd32522dc07',
    clientSecretHash:
      'bbe8f1b2a1415d6942b653689a51ba16f22b41e57a4e44b40799d66c559d2b9b7baf3dd2d9bdc7cd88b6960375862ce40171d0d9be28ee7be293067bb029d61002a0988676f1432153e708d6883c2f8046d758201775c02ef110d32d4be1430eb89db3430a4133d0909be5330e57e03044743ff530f7d040a7946b7db8ff0dad7cb1123e90d1ada397dd85a999b3013d',
  },
  {
    upsert: true,
  },
);

// la_poste
print('Initializing idp: la_poste...');
db.provider.update(
  {
    name: 'la_poste',
  },
  {
    uid: '33f45fae-ebba-4503-9ea4-b59a679c41d3',
    name: 'la_poste',
    active: true,
    display: true,
    title: 'La Poste',
    image: 'fi-laposte.png',
    alt: '',
    eidas: 2,
    mailto: '',
    specificText: 'specific text fip3',
    url: 'https://fip3.docker.dev-franceconnect.fr/',
    statusURL: 'https://fip3.docker.dev-franceconnect.fr/status',
    authzURL: 'https://fip3.docker.dev-franceconnect.fr/user/authorize',
    tokenURL: 'https://fip3.docker.dev-franceconnect.fr/user/token',
    userInfoURL: 'https://fip3.docker.dev-franceconnect.fr/api/user',
    discoveryUrl:
      'https://fip3.docker.dev-franceconnect.fr/.well-known/openid-configuration',
    discovery: true,
    clientID: '09a1a257648c1742c74d6a3d84b',
    clientSecret: '7ae4fef2aab63fb78d777fe657b7536f654s987',
    order: 16,
    updatedAt: '2019-04-24 17:09:17',
    updatedBy: '5cd955c4ee275cd32522dc07',
    clientSecretHash:
      'bbe8f1b2a1415d6942b653689a51ba16f22b41e57a4e44b40799d66c559d2b9b7baf3dd2d9bdc7cd88b6960375862ce40171d0d9be28ee7be293067bb029d61002a0988676f1432153e708d6883c2f8046d758201775c02ef110d32d4be1430eb89db3430a4133d0909be5330e57e03044743ff530f7d040a7946b7db8ff0dad7cb1123e90d1ada397dd85a999b3013d',
  },
  {
    upsert: true,
  },
);

// mobile_connect
print('Initializing idp: mobile_connect...');
db.provider.update(
  {
    name: 'mobile_connect',
  },
  {
    uid: '091341e5-5c2a-410f-b07e-a9c9212d2c8e',
    name: 'mobile_connect',
    active: true,
    display: true,
    title: 'Mobile Connect',
    image: 'fi-mcm.png',
    alt: '',
    eidas: 2,
    mailto: '',
    specificText: 'specific text fip3',
    url: 'https://fip3.docker.dev-franceconnect.fr/',
    statusURL: 'https://fip3.docker.dev-franceconnect.fr/status',
    authzURL: 'https://fip3.docker.dev-franceconnect.fr/user/authorize',
    tokenURL: 'https://fip3.docker.dev-franceconnect.fr/user/token',
    userInfoURL: 'https://fip3.docker.dev-franceconnect.fr/api/user',
    discoveryUrl:
      'https://fip3.docker.dev-franceconnect.fr/.well-known/openid-configuration',
    discovery: true,
    clientID: '09a1a257648c1742c74d6a3d84b',
    clientSecret: '7ae4fef2aab63fb78d777fe657b7536f654s987',
    order: 17,
    updatedAt: '2019-04-24 17:09:17',
    updatedBy: '5cd955c4ee275cd32522dc07',
    clientSecretHash:
      'bbe8f1b2a1415d6942b653689a51ba16f22b41e57a4e44b40799d66c559d2b9b7baf3dd2d9bdc7cd88b6960375862ce40171d0d9be28ee7be293067bb029d61002a0988676f1432153e708d6883c2f8046d758201775c02ef110d32d4be1430eb89db3430a4133d0909be5330e57e03044743ff530f7d040a7946b7db8ff0dad7cb1123e90d1ada397dd85a999b3013d',
  },
  {
    upsert: true,
  },
);

// msa
print('Initializing idp: msa...');
db.provider.update(
  {
    name: 'msa',
  },
  {
    uid: '6f84b4a7-c96b-46a7-aa27-999b3e2b582a',
    name: 'msa',
    active: true,
    display: true,
    title: 'MSA',
    image: 'fi-msa.png',
    alt: '',
    eidas: 2,
    mailto: '',
    specificText: 'specific text fip3',
    url: 'https://fip3.docker.dev-franceconnect.fr/',
    statusURL: 'https://fip3.docker.dev-franceconnect.fr/status',
    authzURL: 'https://fip3.docker.dev-franceconnect.fr/user/authorize',
    tokenURL: 'https://fip3.docker.dev-franceconnect.fr/user/token',
    userInfoURL: 'https://fip3.docker.dev-franceconnect.fr/api/user',
    discoveryUrl:
      'https://fip3.docker.dev-franceconnect.fr/.well-known/openid-configuration',
    discovery: true,
    clientID: '09a1a257648c1742c74d6a3d84b',
    clientSecret: '7ae4fef2aab63fb78d777fe657b7536f654s987',
    order: 18,
    updatedAt: '2019-04-24 17:09:17',
    updatedBy: '5cd955c4ee275cd32522dc07',
    clientSecretHash:
      'bbe8f1b2a1415d6942b653689a51ba16f22b41e57a4e44b40799d66c559d2b9b7baf3dd2d9bdc7cd88b6960375862ce40171d0d9be28ee7be293067bb029d61002a0988676f1432153e708d6883c2f8046d758201775c02ef110d32d4be1430eb89db3430a4133d0909be5330e57e03044743ff530f7d040a7946b7db8ff0dad7cb1123e90d1ada397dd85a999b3013d',
  },
  {
    upsert: true,
  },
);

// alicem
print('Initializing idp: alicem...');
db.provider.update(
  {
    name: 'alicem',
  },
  {
    uid: 'dd61da8c-758a-4cc9-acb9-999d7c13df9a',
    name: 'alicem',
    active: true,
    display: true,
    title: 'Alicem',
    image: 'fi-alicem.png',
    alt: '',
    eidas: 2,
    mailto: '',
    specificText: 'specific text fip3',
    url: 'https://fip3.docker.dev-franceconnect.fr/',
    statusURL: 'https://fip3.docker.dev-franceconnect.fr/status',
    authzURL: 'https://fip3.docker.dev-franceconnect.fr/user/authorize',
    tokenURL: 'https://fip3.docker.dev-franceconnect.fr/user/token',
    userInfoURL: 'https://fip3.docker.dev-franceconnect.fr/api/user',
    discoveryUrl:
      'https://fip3.docker.dev-franceconnect.fr/.well-known/openid-configuration',
    discovery: true,
    clientID: '09a1a257648c1742c74d6a3d84b',
    clientSecret: '7ae4fef2aab63fb78d777fe657b7536f654s987',
    order: 19,
    updatedAt: '2019-04-24 17:09:17',
    updatedBy: '5cd955c4ee275cd32522dc07',
    clientSecretHash:
      'bbe8f1b2a1415d6942b653689a51ba16f22b41e57a4e44b40799d66c559d2b9b7baf3dd2d9bdc7cd88b6960375862ce40171d0d9be28ee7be293067bb029d61002a0988676f1432153e708d6883c2f8046d758201775c02ef110d32d4be1430eb89db3430a4133d0909be5330e57e03044743ff530f7d040a7946b7db8ff0dad7cb1123e90d1ada397dd85a999b3013d',
  },
  {
    upsert: true,
  },
);

// france identité
print('Initializing idp: france_identite...');
db.provider.update(
  {
    name: 'france_identite',
  },
  {
    uid: '23d0f883-2ab2-4472-9b49-b7e5a9dfd22b',
    name: 'france_identite',
    active: true,
    display: true,
    title: 'France Identité',
    image: 'fi-france-identite.svg',
    alt: '',
    eidas: 2,
    mailto: '',
    specificText: 'specific text fi beta',
    url: 'https://fi-beta-mock.docker.dev-franceconnect.fr/',
    statusURL: 'https://fi-beta-mock.docker.dev-franceconnect.fr/status',
    authzURL: 'https://fi-beta-mock.docker.dev-franceconnect.fr/user/authorize',
    tokenURL: 'https://fi-beta-mock.docker.dev-franceconnect.fr/user/token',
    userInfoURL: 'https://fi-beta-mock.docker.dev-franceconnect.fr/api/user',
    discoveryUrl:
      'https://fi-beta-mock.docker.dev-franceconnect.fr/.well-known/openid-configuration',
    discovery: true,
    clientID: '09a1a257648c1742c74d6a3d84m',
    client_secret:
      '+3wLzOoeALg6COG66XCPQNxxiH3jYNzEOxLGWOyaiI/PLYDY5xp7KlNMgJNYPhTQSa1kKFcqg5G5SnOK',
    order: 0,
    updatedAt: '2022-09-05 12:09:17',
    updatedBy: '5cd955c4ee275cd32522dc07',
    clientSecretHash:
      'bbe8f1b2a1415d6942b653689a51ba16f22b41e57a4e44b40799d66c559d2b9b7baf3dd2d9bdc7cd88b6960375862ce40171d0d9be28ee7be293067bb029d61002a0988676f1432153e708d6883c2f8046d758201775c02ef110d32d4be1430eb89db3430a4133d0909be5330e57e03044743ff530f7d040a7946b7db8ff0dad7cb1123e90d1ada397dd85a999b3013d',
    isBeta: true,
    betaText: 'J’utilise ma carte d’identité électronique',
  },
  {
    upsert: true,
  },
);
