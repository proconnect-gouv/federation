import { IEventMap } from '@fc/tracking';
import { EventsCategories } from './enums';

export function getEventsMap(urlPrefix: string): IEventMap {
  return {
    // Front channel
    FCP_AUTHORIZE_INITIATED: {
      step: '1.0.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FCP_AUTHORIZE_INITIATED',
      route: `${urlPrefix}/authorize`,
      exceptions: [],
      intercept: false,
    },

    FCP_SHOWED_IDP_CHOICE: {
      step: '2.0.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FCP_SHOWED_IDP_CHOICE',
      route: `${urlPrefix}/interaction/:uid`,
      exceptions: [],
      intercept: true,
    },

    IDP_CHOSEN: {
      step: '3.0.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'IDP_CHOSEN',
      route: `${urlPrefix}/redirect-to-idp`,
      exceptions: [],
      intercept: true,
    },

    IDP_REQUESTED_FC_JWKS: {
      step: '3.1.0',
      category: EventsCategories.DISCOVERY,
      event: 'IDP_REQUESTED_FC_JWKS',
      route: `${urlPrefix}/client/.well-known/jwks`,
      exceptions: [],
      intercept: true,
    },

    IDP_CALLEDBACK: {
      step: '4.0.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'IDP_CALLEDBACK',
      route: `${urlPrefix}/oidc-callback/:providerId`,
      exceptions: [],
      intercept: true,
    },

    FCP_REQUESTED_IDP_TOKEN: {
      step: '4.1.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FCP_REQUESTED_IDP_TOKEN',
      route: `${urlPrefix}/oidc-callback/:providerId`,
      exceptions: [],
      intercept: false,
    },

    FCP_REQUESTED_IDP_USERINFO: {
      step: '4.2.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FCP_REQUESTED_IDP_USERINFO',
      route: `${urlPrefix}/oidc-callback/:providerId`,
      exceptions: [],
      intercept: false,
    },

    FCP_REQUESTED_RNIPP: {
      step: '4.3.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FCP_REQUESTED_RNIPP',
      route: `${urlPrefix}/interaction/:uid/verify`,
      exceptions: [],
      intercept: false,
    },

    FCP_RECEIVED_RNIPP: {
      step: '4.4.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FCP_RECEIVED_RNIPP',
      route: `${urlPrefix}/interaction/:uid/verify`,
      exceptions: [],
      intercept: false,
    },

    FCP_FAILED_RNIPP: {
      step: '4.4.1',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FCP_FAILED_RNIPP',
      route: `${urlPrefix}/interaction/:uid/verify`,
      exceptions: [],
      intercept: false,
    },

    FCP_RECEIVED_VALID_RNIPP: {
      step: '4.4.2',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FCP_RECEIVED_VALID_RNIPP',
      route: `${urlPrefix}/interaction/:uid/verify`,
      exceptions: [],
      intercept: false,
    },

    FCP_RECEIVED_DECEASED_RNIPP: {
      step: '4.4.3',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FCP_RECEIVED_DECEASED_RNIPP',
      route: `${urlPrefix}/interaction/:uid/verify`,
      exceptions: [],
      intercept: false,
    },

    FCP_RECEIVED_INVALID_RNIPP: {
      step: '4.4.3',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FCP_RECEIVED_INVALID_RNIPP',
      route: `${urlPrefix}/interaction/:uid/verify`,
      exceptions: [],
      intercept: false,
    },

    FCP_VERIFIED: {
      step: '5.0.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FCP_VERIFIED',
      route: `${urlPrefix}/interaction/:uid/verify`,
      exceptions: [],
      intercept: true,
    },

    FCP_SHOWED_CONSENT: {
      step: '6.1.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FCP_SHOWED_CONSENT',
      route: `${urlPrefix}/interaction/:uid/consent`,
      exceptions: [],
      intercept: true,
    },

    FCP_REDIRECTED_TO_SP: {
      step: '7.0.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FCP_REDIRECTED_TO_SP',
      route: `${urlPrefix}/interaction/:uid/login`,
      exceptions: [],
      intercept: true,
    },

    FCP_CONSENTED: {
      step: '7.1.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FCP_CONSENTED',
      route: `${urlPrefix}/interaction/:uid/consent`,
      exceptions: [],
      intercept: true,
    },

    // Discovery
    SP_REQUESTED_FCP_JWKS: {
      step: '7.1.0',
      category: EventsCategories.DISCOVERY,
      event: 'SP_REQUESTED_FCP_JWKS',
      route: `${urlPrefix}/jwks`,
      exceptions: [],
      intercept: true,
    },

    // Back channel
    FS_REQUESTED_FCP_TOKEN: {
      step: '7.2.0',
      category: EventsCategories.BACK_CINEMATIC,
      event: 'FS_REQUESTED_FCP_TOKEN',
      route: `${urlPrefix}/token`,
      exceptions: [],
      intercept: false,
    },
    FS_REQUESTED_FCP_USERINFO: {
      step: '7.3.0',
      category: EventsCategories.BACK_CINEMATIC,
      event: 'FS_REQUESTED_FCP_USERINFO',
      route: `${urlPrefix}/userinfo`,
      exceptions: [],
      intercept: false,
    },

    // Not supported yet
    FS_REQUESTED_LOGOUT: {
      step: '8.0.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FS_REQUESTED_LOGOUT',
      route: `${urlPrefix}/session/end`,
      exceptions: [],
      intercept: false,
    },
  };
}
