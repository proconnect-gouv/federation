import { ObjectID } from 'mongodb';

export const configuration: any = [
  {
    id: new ObjectID('5d7a1f9242026edfc3e8a91e'),
    env: 'development',
    mode: 'particuliers',
    cookieSigningSecret:
      '9ed64cd3762973c8a5219e0774671940a3550ae1050af86831d613193e825caa',
    cookieDomain: '.fcp.docker.dev-franceconnect.fr',
    serverTimeout: 25000,
    accessTokenTTL: 1200,
    tracesId:
      '6925fb8143c76eded44d32b40c0cb1006065f7f003de52712b78985704f39950',
    tracesSecret:
      '99c1105d041adda2c47835a82f6be9dc13e2a2731e302e6f214075aef09f5abb',
    partnerUrl: 'https://partenaires.docker.dev-franceconnect.fr',
    issuerURL: 'https://fcp.docker.dev-franceconnect.fr',
    callbackURL: 'https://fcp.docker.dev-franceconnect.fr/oidc_callback',
    logger: {
      level: 'debug',
      slowtime: true,
      prettyPrint: true,
    },
    debug: {
      logPath: ['/var/log/fc-tech/FC-err.log', '/var/log/fc-tech/FC-out.log'],
    },
    bunyan: {
      path: '/var/log/fc-evt/event.log',
    },
    scope: ['profile', 'email', 'address', 'phone', 'birth'],
    features: {
      displayMessageOnLogin: true,
      debugMode: true,
      enableMails: {
        authentication: false,
        rnippError: false,
        partnerAccountManagement: false,
        IdentityProviderStats: false,
        ServiceProviderStats: false,
        generalStats: false,
      },
      nonceMandatory: true,
      accessTokenHeaderOnly: true,
      secureCookieFlag: true,
      convertToJsonIdentityFromCheckToken: true,
      globalAgentForHTTPS: true,
      displayConfirmationAfterAuthentication: true,
      acr_values: true,
      isFSUsingMouseFlow: [],
      isWebsiteUsingMouseFlow: false,
      rnippIdentityCheck: true,
    },
    httpsGlobalAgent: {
      certPath: '/var/lib/franceconnect/certif-client.pem',
      keyPath: '/var/lib/franceconnect/certif-client.key',
    },
    mobileConnect: {
      callbackURL: 'https://fcp.docker.dev-franceconnect.fr/mc_callback',
      authorizationURL:
        'https://liveidentity-prp.multimediabs.com/user/authorize',
      tokenURL: 'https://liveidentity-prp.multimediabs.com/user/token',
      userInfoURL: 'https://liveidentity-prp.multimediabs.com/api/user',
      clientID: 'fcconnect',
      client_secret: '0123456789abcdefghijklmnopqrstuvwxyz',
    },
    rnipp: {
      httpsEnabled: true,
      hostname: 'mock-rnipp.docker.dev-franceconnect.fr',

      clientSiret: '12003704900026',
      userId: 'SGMAP FranceConnect',
    },
    applicationsApiAuthorization: [
      {
        tokenAccess:
          '56d08c71985eba066ae6c41bc7376c9744829dbca65b71a218c63b955d51e092',
        api: [
          '/api/v1/service-provider',
          '/api/v1/service-provider/names/:key',
          '/api/v1/service-provider/:key',
          '/api/v1/service-provider/production-key/:key',
          '/api/v1/stats/:clientKey/user/connection',
          '/api/v1/stats/:clientKey/user/gender',
          '/api/v1/stats/:clientKey/user/age',
          '/api/v1/stats/:clientKey/user/fi',
          '/api/v1/service-provider/create',
          '/api/v1/stats/accounts',
          '/api/v1/stats/total/connection',
        ],
      },
      {
        tokenAccess:
          '07BF7A057C75556EA68E7EED6F78ACF14222822B90DA055E7B9073327DF3EB33',
        api: ['/api/v2/service-provider/integration/create'],
      },
    ],
    messageOnLogin: {
      recipient: false,
      message: 'Message',
      startDate: '2019-09-20',
      startHour: '17:24',
      stopDate: '2019-09-20',
      stopHour: '17:25',
      startRNIPPMessageHour: '',
      stopRNIPPMessageHour: '',
    },
    fiMappingUserInfosRules: {
      invertFamilyNameAttribute: ['idn'],
    },
    companyAPI: {
      url: 'https://api.apientreprise.fr/v2/entreprises',
      token: 'So1aed1fod0pohroxooQu9Ixa0uezoh8oohie7th',
      recipientSiret: '13001922700011',
    },
    _meta: {
      author: 'ansible',
      creation_date: '2019-09-11T10:35:30.807079Z',
    },
    FRIDPIdentity: {
      fsList: [],
    },
    mailjet: {
      user: '49ef66eb65a47002941da3ee96f539c5',
      key: '93736bcfcbf52562d5e5d6fd7d4bf139',
    },
  },
  {
    id: new ObjectID('5d7a1f9242026edfc3e8a91d'),
    env: 'development',
    mode: 'particuliers',
    cookieSigningSecret:
      '9ed64cd3762973c8a5219e0774671940a3550ae1050af86831d613193e825caa',
    cookieDomain: '.fcp.docker.dev-franceconnect.fr',
    serverTimeout: 25000,
    accessTokenTTL: 1200,
    tracesId:
      '6925fb8143c76eded44d32b40c0cb1006065f7f003de52712b78985704f39950',
    tracesSecret:
      '99c1105d041adda2c47835a82f6be9dc13e2a2731e302e6f214075aef09f5abb',
    partnerUrl: 'https://partenaires.docker.dev-franceconnect.fr',
    issuerURL: 'https://fcp.docker.dev-franceconnect.fr',
    callbackURL: 'https://fcp.docker.dev-franceconnect.fr/oidc_callback',
    logger: {
      level: 'debug',
      slowtime: true,
      prettyPrint: true,
    },
    debug: {
      logPath: ['/var/log/fc-tech/FC-err.log', '/var/log/fc-tech/FC-out.log'],
    },
    bunyan: {
      path: '/var/log/fc-evt/event.log',
    },
    scope: ['profile', 'email', 'address', 'phone', 'birth'],
    features: {
      displayMessageOnLogin: true,
      debugMode: true,
      enableMails: {
        authentication: false,
        rnippError: false,
        partnerAccountManagement: false,
        IdentityProviderStats: false,
        ServiceProviderStats: false,
        generalStats: false,
      },
      nonceMandatory: true,
      accessTokenHeaderOnly: true,
      secureCookieFlag: true,
      convertToJsonIdentityFromCheckToken: true,
      globalAgentForHTTPS: true,
      displayConfirmationAfterAuthentication: true,
      acr_values: true,
      isFSUsingMouseFlow: [],
      isWebsiteUsingMouseFlow: false,
      rnippIdentityCheck: true,
    },
    httpsGlobalAgent: {
      certPath: '/var/lib/franceconnect/certif-client.pem',
      keyPath: '/var/lib/franceconnect/certif-client.key',
    },
    mobileConnect: {
      callbackURL: 'https://fcp.docker.dev-franceconnect.fr/mc_callback',
      authorizationURL:
        'https://liveidentity-prp.multimediabs.com/user/authorize',
      tokenURL: 'https://liveidentity-prp.multimediabs.com/user/token',
      userInfoURL: 'https://liveidentity-prp.multimediabs.com/api/user',
      clientID: 'fcconnect',
      client_secret: '0123456789abcdefghijklmnopqrstuvwxyz',
    },
    rnipp: {
      httpsEnabled: true,
      hostname: 'mock-rnipp.docker.dev-franceconnect.fr',
      clientSiret: '12003704900026',
      userId: 'SGMAP FranceConnect',
    },
    applicationsApiAuthorization: [
      {
        tokenAccess:
          '56d08c71985eba066ae6c41bc7376c9744829dbca65b71a218c63b955d51e092',
        api: [
          '/api/v1/service-provider',
          '/api/v1/service-provider/names/:key',
          '/api/v1/service-provider/:key',
          '/api/v1/service-provider/production-key/:key',
          '/api/v1/stats/:clientKey/user/connection',
          '/api/v1/stats/:clientKey/user/gender',
          '/api/v1/stats/:clientKey/user/age',
          '/api/v1/stats/:clientKey/user/fi',
          '/api/v1/service-provider/create',
          '/api/v1/stats/accounts',
          '/api/v1/stats/total/connection',
        ],
      },
      {
        tokenAccess:
          '07BF7A057C75556EA68E7EED6F78ACF14222822B90DA055E7B9073327DF3EB33',
        api: ['/api/v2/service-provider/integration/create'],
      },
    ],
    messageOnLogin: {
      recipient: false,
      message: 'Message je suis',
      startDate: '2019-09-20',
      startHour: '17:24',
      stopDate: '2019-09-20',
      stopHour: '17:25',
      startRNIPPMessageHour: '',
      stopRNIPPMessageHour: '',
    },
    fiMappingUserInfosRules: {
      invertFamilyNameAttribute: ['idn'],
    },
    companyAPI: {
      url: 'https://api.apientreprise.fr/v2/entreprises',
      token: 'So1aed1fod0pohroxooQu9Ixa0uezoh8oohie7th',
      recipientSiret: '13001922700011',
    },
    _meta: {
      author: 'ansible',
      creation_date: '2019-09-12T10:35:30.807079Z',
    },
    FRIDPIdentity: {
      fsList: [],
    },
    mailjet: {
      user: '49ef66eb65a47002941da3ee96f539c5',
      key: '93736bcfcbf52562d5e5d6fd7d4bf139',
    },
  },
];

export const updateData: any = {
  FRIDPIdentity: {
    fsList: [],
  },
  _meta: {
    author: 'Harry Seldon',
    creation_date: new Date(),
  },
  accessTokenTTL: 1200,
  applicationsApiAuthorization: [
    {
      api: [
        '/api/v1/service-provider',
        '/api/v1/service-provider/names/:key',
        '/api/v1/service-provider/:key',
        '/api/v1/service-provider/production-key/:key',
        '/api/v1/stats/:clientKey/user/connection',
        '/api/v1/stats/:clientKey/user/gender',
        '/api/v1/stats/:clientKey/user/age',
        '/api/v1/stats/:clientKey/user/fi',
        '/api/v1/service-provider/create',
        '/api/v1/stats/accounts',
        '/api/v1/stats/total/connection',
      ],
      tokenAccess:
        '56d08c71985eba066ae6c41bc7376c9744829dbca65b71a218c63b955d51e092',
    },
    {
      api: ['/api/v2/service-provider/integration/create'],
      tokenAccess:
        '07BF7A057C75556EA68E7EED6F78ACF14222822B90DA055E7B9073327DF3EB33',
    },
  ],
  bunyan: { path: '/var/log/fc-evt/event.log' },
  callbackURL: 'https://fcp.docker.dev-franceconnect.fr/oidc_callback',
  companyAPI: {
    recipientSiret: '13001922700011',
    token: 'So1aed1fod0pohroxooQu9Ixa0uezoh8oohie7th',
    url: 'https://api.apientreprise.fr/v2/entreprises',
  },
  cookieDomain: '.fcp.docker.dev-franceconnect.fr',
  cookieSigningSecret:
    '9ed64cd3762973c8a5219e0774671940a3550ae1050af86831d613193e825caa',
  debug: {
    logPath: ['/var/log/fc-tech/FC-err.log', '/var/log/fc-tech/FC-out.log'],
  },
  env: 'development',
  features: {
    accessTokenHeaderOnly: true,
    acr_values: true,
    convertToJsonIdentityFromCheckToken: true,
    debugMode: true,
    displayConfirmationAfterAuthentication: true,
    displayMessageOnLogin: true,
    enableMails: {
      IdentityProviderStats: false,
      ServiceProviderStats: false,
      authentication: false,
      generalStats: false,
      partnerAccountManagement: false,
      rnippError: false,
    },
    globalAgentForHTTPS: true,
    isFSUsingMouseFlow: [],
    isWebsiteUsingMouseFlow: false,
    nonceMandatory: true,
    rnippIdentityCheck: true,
    secureCookieFlag: true,
  },
  fiMappingUserInfosRules: {
    invertFamilyNameAttribute: ['idn'],
  },
  httpsGlobalAgent: {
    certPath: '/var/lib/franceconnect/certif-client.pem',
    keyPath: '/var/lib/franceconnect/certif-client.key',
  },
  issuerURL: 'https://fcp.docker.dev-franceconnect.fr',
  logger: {
    level: 'debug',
    prettyPrint: true,
    slowtime: true,
  },
  mailjet: {
    key: '93736bcfcbf52562d5e5d6fd7d4bf139',
    user: '49ef66eb65a47002941da3ee96f539c5',
  },
  messageOnLogin: {
    message: 'Hello',
    recipient: false,
    startDate: '2019-09-20',
    startHour: '18:24',
    startRNIPPMessageHour: '',
    stopDate: '2019-09-20',
    stopHour: '18:25',
    stopRNIPPMessageHour: '',
  },
  mobileConnect: {
    authorizationURL:
      'https://liveidentity-prp.multimediabs.com/user/authorize',
    callbackURL: 'https://fcp.docker.dev-franceconnect.fr/mc_callback',
    clientID: 'fcconnect',
    client_secret: '0123456789abcdefghijklmnopqrstuvwxyz',
    tokenURL: 'https://liveidentity-prp.multimediabs.com/user/token',
    userInfoURL: 'https://liveidentity-prp.multimediabs.com/api/user',
  },
  mode: 'particuliers',
  partnerUrl: 'https://partenaires.docker.dev-franceconnect.fr',
  rnipp: {
    clientSiret: '12003704900026',
    hostname: 'mock-rnipp.docker.dev-franceconnect.fr',
    httpsEnabled: true,
    userId: 'SGMAP FranceConnect',
  },
  scope: ['profile', 'email', 'address', 'phone', 'birth'],
  serverTimeout: 25000,
  tracesId: '6925fb8143c76eded44d32b40c0cb1006065f7f003de52712b78985704f39950',
  tracesSecret:
    '99c1105d041adda2c47835a82f6be9dc13e2a2731e302e6f214075aef09f5abb',
};
