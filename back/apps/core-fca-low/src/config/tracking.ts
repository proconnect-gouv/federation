import { EventsCategories } from '@fc/core';
import { TrackingConfig } from '@fc/tracking';

export default {
  eventsMap: {
    FC_AUTHORIZE_INITIATED: {
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FC_AUTHORIZE_INITIATED',
    },

    FC_SSO_INITIATED: {
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FC_SSO_INITIATED',
    },

    SP_DISABLED_SSO: {
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'SP_DISABLED_SSO',
    },

    FC_SHOWED_IDP_CHOICE: {
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FC_SHOWED_IDP_CHOICE',
    },

    FC_REDIRECTED_TO_HINTED_IDP: {
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FC_REDIRECTED_TO_HINTED_IDP',
    },

    FC_REDIRECT_TO_IDP: {
      category: EventsCategories.BACK_CINEMATIC,
      event: 'FC_REDIRECT_TO_IDP',
    },

    IDP_CHOSEN: {
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'IDP_CHOSEN',
    },

    IDP_REQUESTED_FC_JWKS: {
      category: EventsCategories.DISCOVERY,
      event: 'IDP_REQUESTED_FC_JWKS',
    },

    IDP_CALLEDBACK: {
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'IDP_CALLEDBACK',
    },

    FC_REQUESTED_IDP_TOKEN: {
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FC_REQUESTED_IDP_TOKEN',
    },

    FC_REQUESTED_IDP_USERINFO: {
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FC_REQUESTED_IDP_USERINFO',
    },

    FC_VERIFIED: {
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FC_VERIFIED',
    },

    FC_IDP_DISABLED: {
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FC_IDP_DISABLED',
    },

    FC_FQDN_MISMATCH: {
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FC_FQDN_MISMATCH',
    },

    FC_REDIRECTED_TO_SP: {
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FC_REDIRECTED_TO_SP',
    },

    SP_REQUESTED_FC_TOKEN: {
      category: EventsCategories.BACK_CINEMATIC,
      event: 'SP_REQUESTED_FC_TOKEN',
    },
    SP_REQUESTED_FC_USERINFO: {
      category: EventsCategories.BACK_CINEMATIC,
      event: 'SP_REQUESTED_FC_USERINFO',
    },

    SP_REQUESTED_LOGOUT: {
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'SP_REQUESTED_LOGOUT',
    },

    FC_REQUESTED_LOGOUT_FROM_IDP: {
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FC_REQUESTED_LOGOUT_FROM_IDP',
    },

    FC_SESSION_TERMINATED: {
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FC_SESSION_TERMINATED',
    },
  },
} as TrackingConfig;
