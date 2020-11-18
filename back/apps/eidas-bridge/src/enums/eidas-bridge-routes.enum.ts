/* istanbul ignore file */

export enum EidasBridgeRoutes {
  DEFAULT = '/',
  INTERACTION = '/interaction/:uid',
  LOGIN = '/login',
  INTERACTION_LOGIN = '/:uid/login',
  LOGIN_CALLBACK = '/login-callback',
  USER_AUTHORIZE = '/user/authorize',
}
