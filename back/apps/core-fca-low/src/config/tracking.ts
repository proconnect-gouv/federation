import { TrackingConfig } from '@fc/tracking';

export default {
  eventsMap: {
    FC_AUTHORIZE_INITIATED: {
      event: 'FC_AUTHORIZE_INITIATED',
    },
    FC_SSO_INITIATED: {
      event: 'FC_SSO_INITIATED',
    },
    SP_DISABLED_SSO: {
      event: 'SP_DISABLED_SSO',
    },
    FC_SHOWED_IDP_CHOICE: {
      event: 'FC_SHOWED_IDP_CHOICE',
    },
    FC_REDIRECTED_TO_HINTED_IDP: {
      event: 'FC_REDIRECTED_TO_HINTED_IDP',
    },
    FC_REDIRECT_TO_IDP: {
      event: 'FC_REDIRECT_TO_IDP',
    },
    IDP_CHOSEN: {
      event: 'IDP_CHOSEN',
    },
    IDP_REQUESTED_FC_JWKS: {
      event: 'IDP_REQUESTED_FC_JWKS',
    },
    IDP_CALLEDBACK: {
      event: 'IDP_CALLEDBACK',
    },
    FC_REQUESTED_IDP_TOKEN: {
      event: 'FC_REQUESTED_IDP_TOKEN',
    },
    FC_REQUESTED_IDP_USERINFO: {
      event: 'FC_REQUESTED_IDP_USERINFO',
    },
    FC_VERIFIED: {
      event: 'FC_VERIFIED',
    },
    FC_IDP_DISABLED: {
      event: 'FC_IDP_DISABLED',
    },
    FC_FQDN_MISMATCH: {
      event: 'FC_FQDN_MISMATCH',
    },
    FC_REDIRECTED_TO_SP: {
      event: 'FC_REDIRECTED_TO_SP',
    },
    SP_REQUESTED_FC_TOKEN: {
      event: 'SP_REQUESTED_FC_TOKEN',
    },
    SP_REQUESTED_FC_USERINFO: {
      event: 'SP_REQUESTED_FC_USERINFO',
    },
    SP_REQUESTED_LOGOUT: {
      event: 'SP_REQUESTED_LOGOUT',
    },
    FC_REQUESTED_LOGOUT_FROM_IDP: {
      event: 'FC_REQUESTED_LOGOUT_FROM_IDP',
    },
    FC_SESSION_TERMINATED: {
      event: 'FC_SESSION_TERMINATED',
    },
  },
} as TrackingConfig;
