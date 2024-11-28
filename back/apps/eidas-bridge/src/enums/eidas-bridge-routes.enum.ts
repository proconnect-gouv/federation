export enum EidasBridgeRoutes {
  BASE = '/oidc-client',
  INIT_SESSION = '/init-session',
  REDIRECT_TO_FC_AUTHORIZE = '/redirect-to-fc-authorize',
  INTERACTION = '/interaction/:uid',
  INTERACTION_LOGIN = '/:uid/login',
  FINISH_FC_INTERACTION = '/interaction/oidc/finish',
  REDIRECT_TO_EIDAS_RESPONSE_PROXY = '/redirect-to-eidas-response-proxy',
}
