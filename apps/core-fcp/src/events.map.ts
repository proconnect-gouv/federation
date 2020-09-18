import { IEventMap } from '@fc/tracking';
import { EventsCategories } from './enums';
import {
  RnippDeceasedException,
  RnippNotFoundMultipleEchoException,
  RnippNotFoundNoEchoException,
  RnippNotFoundSingleEchoException,
  RnippFoundOnlyWithMaritalNameException,
} from '@fc/rnipp';

export function getEventsMap(urlPrefix: string): IEventMap {
  return {
    // Front channel
    FCP_AUTHORIZE_INITIATED: {
      step: '1.0.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FCP_AUTHORIZE_INITIATED',
      exceptions: [],
      route: `${urlPrefix}/authorize`,
      intercept: false,
    },

    FCP_SHOWED_IDP_CHOICE: {
      step: '2.0.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FCP_SHOWED_IDP_CHOICE',
      exceptions: [],
      route: `${urlPrefix}/interaction/:uid`,
      intercept: true,
    },

    IDP_CHOSEN: {
      step: '3.0.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'IDP_CHOSEN',
      exceptions: [],
      route: `${urlPrefix}/redirect-to-idp`,
      intercept: true,
    },

    IDP_REQUESTED_FC_JWKS: {
      step: '3.1.0',
      category: EventsCategories.DISCOVERY,
      event: 'IDP_REQUESTED_FC_JWKS',
      exceptions: [],
      route: `${urlPrefix}/client/.well-known/jwks`,
      intercept: true,
    },

    IDP_CALLEDBACK: {
      step: '4.0.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'IDP_CALLEDBACK',
      exceptions: [],
      route: `${urlPrefix}/oidc-callback/:providerId`,
      intercept: true,
    },

    FCP_REQUESTED_IDP_TOKEN: {
      step: '4.1.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FCP_REQUESTED_IDP_TOKEN',
      exceptions: [],
      route: `${urlPrefix}/oidc-callback/:providerId`,
      intercept: false,
    },

    FCP_REQUESTED_IDP_USERINFO: {
      step: '4.2.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FCP_REQUESTED_IDP_USERINFO',
      exceptions: [],
      route: `${urlPrefix}/oidc-callback/:providerId`,
      intercept: false,
    },

    FCP_REQUESTED_RNIPP: {
      step: '4.3.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FCP_REQUESTED_RNIPP',
      exceptions: [],
      route: `${urlPrefix}/interaction/:uid/verify`,
      intercept: false,
    },

    FCP_RECEIVED_RNIPP: {
      step: '4.4.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FCP_RECEIVED_RNIPP',
      exceptions: [],
      route: `${urlPrefix}/interaction/:uid/verify`,
      intercept: false,
    },

    FCP_FAILED_RNIPP: {
      step: '4.4.1',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FCP_FAILED_RNIPP',
      exceptions: [],
      route: `${urlPrefix}/interaction/:uid/verify`,
      intercept: false,
    },

    FCP_RECEIVED_VALID_RNIPP: {
      step: '4.4.2',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FCP_RECEIVED_VALID_RNIPP',
      exceptions: [],
      route: `${urlPrefix}/interaction/:uid/verify`,
      intercept: false,
    },

    FCP_RECEIVED_DECEASED_RNIPP: {
      step: '4.4.3',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FCP_RECEIVED_DECEASED_RNIPP',
      exceptions: [RnippDeceasedException],
      route: `${urlPrefix}/interaction/:uid/verify`,
      intercept: false,
    },

    FCP_RECEIVED_INVALID_RNIPP: {
      step: '4.4.3',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FCP_RECEIVED_INVALID_RNIPP',
      exceptions: [
        RnippNotFoundMultipleEchoException,
        RnippNotFoundNoEchoException,
        RnippNotFoundSingleEchoException,
        RnippFoundOnlyWithMaritalNameException,
      ],
      route: `${urlPrefix}/interaction/:uid/verify`,
      intercept: false,
    },

    FCP_VERIFIED: {
      step: '5.0.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FCP_VERIFIED',
      exceptions: [],
      route: `${urlPrefix}/interaction/:uid/verify`,
      intercept: true,
    },

    FCP_SHOWED_CONSENT: {
      step: '6.1.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FCP_SHOWED_CONSENT',
      exceptions: [],
      route: `${urlPrefix}/interaction/:uid/consent`,
      intercept: true,
    },

    FCP_REDIRECTED_TO_SP: {
      step: '7.0.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FCP_REDIRECTED_TO_SP',
      exceptions: [],
      route: `${urlPrefix}/interaction/:uid/login`,
      intercept: true,
    },

    FCP_CONSENTED: {
      step: '7.1.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FCP_CONSENTED',
      exceptions: [],
      route: `${urlPrefix}/interaction/:uid/consent`,
      intercept: true,
    },

    // Discovery
    SP_REQUESTED_FCP_JWKS: {
      step: '7.1.0',
      category: EventsCategories.DISCOVERY,
      event: 'SP_REQUESTED_FCP_JWKS',
      exceptions: [],
      route: `${urlPrefix}/jwks`,
      intercept: true,
    },

    // Back channel
    FS_REQUESTED_FCP_TOKEN: {
      step: '7.2.0',
      category: EventsCategories.BACK_CINEMATIC,
      event: 'FS_REQUESTED_FCP_TOKEN',
      exceptions: [],
      route: `${urlPrefix}/token`,
      intercept: false,
    },
    FS_REQUESTED_FCP_USERINFO: {
      step: '7.3.0',
      category: EventsCategories.BACK_CINEMATIC,
      event: 'FS_REQUESTED_FCP_USERINFO',
      exceptions: [],
      route: `${urlPrefix}/userinfo`,
      intercept: false,
    },

    // Not supported yet
    FS_REQUESTED_LOGOUT: {
      step: '8.0.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FS_REQUESTED_LOGOUT',
      exceptions: [],
      route: `${urlPrefix}/session/end`,
      intercept: false,
    },
  };
}
