export const messageDictionary: Record<string, string> = {
  // Exceptions
  'exceptions.default_message':
    "Une erreur s'est produite, veuillez réessayer ultérieurement",

  // bridge-http-proxy
  'BridgeHttpProxy.exceptions.bridgeHttpProxyCsmr':
    'Une erreur technique est survenue. Si le problème persiste, veuillez nous contacter.',
  'BridgeHttpProxy.exceptions.bridgeHttpProxyRabbitmq':
    'Une erreur technique est survenue. Si le problème persiste, veuillez nous contacter.',
  'BridgeHttpProxy.exceptions.bridgeHttpProxyVariableMissing':
    'Une erreur technique est survenue. Si le problème persiste, veuillez nous contacter.',

  // async-local-storage
  'AsyncLocalStorage.exceptions.asyncLocalStorageNotFound':
    'Une erreur technique est survenue. Si le problème persiste, veuillez nous contacter.',

  // core
  'Core.exceptions.coreIdentityProviderNotFound':
    'Une erreur technique est survenue. Si le problème persiste, veuillez nous contacter.',
  'Core.exceptions.coreIdpBlockedForAccount':
    "Vous avez bloqué l'utilisation de ce fournisseur d'identité. Pour pouvoir l'utiliser, merci de vous rendre dans vos préférences FranceConnect pour l'autoriser.",
  'Core.exceptions.coreInvalidAcr':
    'Une erreur technique est survenue. Si le problème persiste, veuillez nous contacter.',
  'Core.exceptions.coreLowAcr':
    'Une erreur technique est survenue. Si le problème persiste, veuillez nous contacter.',
  'Core.exceptions.coreMissingContext':
    'Une erreur technique est survenue, fermez l’onglet de votre navigateur et reconnectez-vous.',
  'Core.exceptions.coreMissingIdentity':
    'Une erreur technique est survenue, fermez l’onglet de votre navigateur et reconnectez-vous.',

  // cryptography
  'Cryptography.exceptions.lowEntropyArgument':
    'Entropy must be at least 32 Bytes for random bytes generation',
  'Cryptography.exceptions.passwordHashFailure':
    'Une erreur technique est survenue. Si le problème persiste, veuillez nous contacter.',

  // csrf
  'Csrf.exceptions.csrfBadToken':
    'Votre session a expiré ou est invalide, fermez l’onglet de votre navigateur et reconnectez-vous.',
  'Csrf.exceptions.csrfMissingToken':
    'Votre session a expiré ou est invalide, fermez l’onglet de votre navigateur et reconnectez-vous.',

  // csv
  'Csv.exceptions.csvParsing':
    'Une erreur technique est survenue. Si le problème persiste, veuillez nous contacter.',

  // flow-steps
  'FlowSteps.exceptions.undefinedStepRoute':
    'Nous vous invitons à fermer tous les onglets de votre navigateur et à vous authentifier de nouveau en suivant les étapes de connexion.',
  'FlowSteps.exceptions.unexpectedNavigation':
    'Nous vous invitons à fermer tous les onglets de votre navigateur et à vous authentifier de nouveau en suivant les étapes de connexion.',

  // oidc-client
  'OidcClient.exceptions.oidcClientGetEndSessionUrl':
    'Une erreur technique est survenue. Si le problème persiste, veuillez nous contacter.',
  'OidcClient.exceptions.oidcClientIdpBlacklisted':
    'Une erreur technique est survenue, fermez l’onglet de votre navigateur et reconnectez-vous.',
  'OidcClient.exceptions.oidcClientIdpDisabled':
    'Une erreur technique est survenue, fermez l’onglet de votre navigateur et reconnectez-vous.',
  'OidcClient.exceptions.oidcClientIdpFailedToFetchBlacklist':
    'Une erreur technique est survenue. Si le problème persiste, veuillez nous contacter.',
  'OidcClient.exceptions.oidcClientIdpNotFound':
    'Une erreur technique est survenue, fermez l’onglet de votre navigateur et reconnectez-vous.',
  'OidcClient.exceptions.oidcClientInvalidState':
    'Une erreur technique est survenue, fermez l’onglet de votre navigateur et reconnectez-vous.',
  'OidcClient.exceptions.oidcClientMissingState':
    'Une erreur technique est survenue. Si le problème persiste, veuillez nous contacter.',
  'OidcClient.exceptions.oidcClientTokenFailed':
    'Une erreur technique est survenue. Si le problème persiste, veuillez nous contacter.',
  'OidcClient.exceptions.oidcClientTokenResultFailed':
    'Une erreur technique est survenue. Si le problème persiste, veuillez nous contacter.',
  'OidcClient.exceptions.oidcClientUserinfosFailed':
    'Une erreur technique est survenue. Si le problème persiste, veuillez nous contacter.',

  // oidc-provider
  'OidcProvider.exceptions.oidcProviderAuthorizeParams':
    'Une erreur technique est survenue, fermez l’onglet de votre navigateur et reconnectez-vous.',
  'OidcProvider.exceptions.oidcProviderInitialisation':
    'Une erreur technique est survenue. Si le problème persiste, veuillez nous contacter.',
  'OidcProvider.exceptions.oidcProviderParseJsonClaims':
    'Une erreur technique est survenue, fermez l’onglet de votre navigateur et reconnectez-vous.',
  'OidcProvider.exceptions.oidcProviderParseRedisResponse':
    'Une erreur technique est survenue, fermez l’onglet de votre navigateur et reconnectez-vous.',
  'OidcProvider.exceptions.oidcProviderStringifyPayloadForRedis':
    'Une erreur technique est survenue. Si le problème persiste, veuillez nous contacter.',
  'OidcProvider.exceptions.RuntimeException':
    'Une erreur technique est survenue, fermez l’onglet de votre navigateur et reconnectez-vous.',

  InvalidClient: 'Client non trouvé (client_id invalide)',
  InvalidRedirectUri: 'L’URL de callback n’est pas valide',

  // session
  'Session.exceptions.sessionBadAlias':
    'Votre session a expiré ou est invalide, fermez l’onglet de votre navigateur et reconnectez-vous.',
  'Session.exceptions.sessionBadCookie':
    'Votre session a expiré ou est invalide, fermez l’onglet de votre navigateur et reconnectez-vous.',
  'Session.exceptions.sessionBadFormat':
    'Votre session a expiré ou est invalide, fermez l’onglet de votre navigateur et reconnectez-vous.',
  'Session.exceptions.sessionBadStringify':
    'Votre session a expiré ou est invalide, fermez l’onglet de votre navigateur et reconnectez-vous.',
  'Session.exceptions.sessionCannotCommitUndefinedSession':
    'Votre session a expiré, fermez l’onglet de votre navigateur et reconnectez-vous.',
  'Session.exceptions.sessionInvalidSession':
    'Votre session a expiré ou est invalide, fermez l’onglet de votre navigateur et reconnectez-vous.',
  'Session.exceptions.sessionNoSessionId':
    'Votre session a expiré ou est invalide, fermez l’onglet de votre navigateur et reconnectez-vous.',
  'Session.exceptions.sessionNotFound':
    'Votre session a expiré ou est invalide, fermez l’onglet de votre navigateur et reconnectez-vous.',
  'Session.exceptions.sessionStorage':
    'Votre session a expiré ou est invalide, fermez l’onglet de votre navigateur et reconnectez-vous. Si le problème persiste, contacter le support',
};
