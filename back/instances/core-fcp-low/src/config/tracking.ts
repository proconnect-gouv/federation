import { RequestMethod } from '@nestjs/common';

import { CoreRoutes } from '@fc/core';
import { EventsCategories } from '@fc/core-fcp';
import { OidcClientRoutes } from '@fc/oidc-client';
import {
  RnippCitizenStatusFormatException,
  RnippDeceasedException,
  RnippFoundOnlyWithMaritalNameException,
  RnippHttpStatusException,
  RnippNotFoundMultipleEchoException,
  RnippNotFoundNoEchoException,
  RnippNotFoundSingleEchoException,
  RnippRejectedBadRequestException,
  RnippTimeoutException,
} from '@fc/rnipp';
import { TrackingConfig } from '@fc/tracking';

export default {
  eventsMap: {
    FC_AUTHORIZE_INITIATED: {
      step: '1.0.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FC_AUTHORIZE_INITIATED',
    },

    FC_SSO_INITIATED: {
      step: '1.1.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FC_SSO_INITIATED',
    },

    FC_SHOWED_IDP_CHOICE: {
      step: '2.0.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FC_SHOWED_IDP_CHOICE',
    },

    FC_REDIRECTED_TO_HINTED_IDP: {
      step: '2.1.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FC_REDIRECTED_TO_HINTED_IDP',
    },

    IDP_CHOSEN: {
      step: '3.0.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'IDP_CHOSEN',
      interceptRoutes: [
        { method: RequestMethod.POST, path: OidcClientRoutes.REDIRECT_TO_IDP },
      ],
    },

    IDP_REQUESTED_FC_JWKS: {
      step: '3.1.0',
      category: EventsCategories.DISCOVERY,
      event: 'IDP_REQUESTED_FC_JWKS',
      interceptRoutes: [
        { method: RequestMethod.GET, path: OidcClientRoutes.WELL_KNOWN_KEYS },
      ],
    },

    IDP_CALLEDBACK: {
      step: '4.0.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'IDP_CALLEDBACK',
    },

    IDP_CALLEDBACK_WITH_ERROR: {
      step: '4.0.5',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'IDP_CALLEDBACK_WITH_ERROR',
    },

    FC_REQUESTED_IDP_TOKEN: {
      step: '4.1.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FC_REQUESTED_IDP_TOKEN',
    },

    FC_REQUESTED_IDP_USERINFO: {
      step: '4.2.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FC_REQUESTED_IDP_USERINFO',
    },

    FC_REQUESTED_RNIPP: {
      step: '4.3.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FC_REQUESTED_RNIPP',
    },

    FC_RECEIVED_RNIPP: {
      step: '4.4.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FC_RECEIVED_RNIPP',
    },

    FC_FAILED_RNIPP: {
      step: '4.4.1',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FC_FAILED_RNIPP',
      exceptions: [
        RnippTimeoutException,
        RnippHttpStatusException,
        RnippRejectedBadRequestException,
      ],
    },

    FC_RECEIVED_VALID_RNIPP: {
      step: '4.4.2',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FC_RECEIVED_VALID_RNIPP',
    },

    FC_RECEIVED_DECEASED_RNIPP: {
      step: '4.4.3',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FC_RECEIVED_DECEASED_RNIPP',
      exceptions: [RnippDeceasedException],
    },

    FC_RECEIVED_INVALID_RNIPP: {
      step: '4.4.3',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FC_RECEIVED_INVALID_RNIPP',
      exceptions: [
        RnippNotFoundMultipleEchoException,
        RnippNotFoundNoEchoException,
        RnippNotFoundSingleEchoException,
        RnippFoundOnlyWithMaritalNameException,
        RnippCitizenStatusFormatException,
      ],
    },

    FC_VERIFIED: {
      step: '5.0.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FC_VERIFIED',
    },

    FC_IDP_DISABLED: {
      step: '5.1.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FC_IDP_DISABLED',
    },

    FC_IDP_BLACKLISTED: {
      step: '5.2.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FC_IDP_BLACKLISTED',
    },

    FC_IDP_INSUFFICIENT_ACR: {
      step: '5.3.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FC_IDP_INSUFFICIENT_ACR',
    },

    FC_VALID_REP_SCOPE: {
      step: '5.4.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FC_VALID_REP_SCOPE',
    },

    FC_INVALID_REP_SCOPE: {
      step: '5.4.1',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FC_INVALID_REP_SCOPE',
    },

    FC_SHOWED_CONSENT: {
      step: '6.1.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FC_SHOWED_CONSENT',
    },

    FC_DATATRANSFER_INFORMATION_ANONYMOUS: {
      step: '6.2.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FC_DATATRANSFER_INFORMATION_ANONYMOUS',
    },

    FC_DATATRANSFER_INFORMATION_IDENTITY: {
      step: '6.2.1',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FC_DATATRANSFER_INFORMATION_IDENTITY',
    },

    FC_DATATRANSFER_CONSENT_IDENTITY: {
      step: '6.2.2',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FC_DATATRANSFER_CONSENT_IDENTITY',
    },

    FC_REDIRECTED_TO_SP: {
      step: '7.0.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FC_REDIRECTED_TO_SP',
      interceptRoutes: [
        { method: RequestMethod.POST, path: CoreRoutes.INTERACTION_LOGIN },
      ],
    },

    // Discovery
    SP_REQUESTED_FC_JWKS: {
      step: '7.1.0',
      category: EventsCategories.DISCOVERY,
      event: 'SP_REQUESTED_FC_JWKS',
      interceptRoutes: [
        { method: RequestMethod.GET, path: CoreRoutes.JWKS_URI },
      ],
    },

    SP_REQUESTED_FC_TOKEN: {
      step: '7.2.0',
      category: EventsCategories.BACK_CINEMATIC,
      event: 'SP_REQUESTED_FC_TOKEN',
    },
    SP_REQUESTED_FC_USERINFO: {
      step: '7.3.0',
      category: EventsCategories.BACK_CINEMATIC,
      event: 'SP_REQUESTED_FC_USERINFO',
    },

    DP_VERIFIED_FC_CHECKTOKEN: {
      step: '7.4.0',
      category: EventsCategories.BACK_CINEMATIC,
      event: 'DP_VERIFIED_FC_CHECKTOKEN',
    },

    DP_USED_INVALID_CREDENTIAL: {
      step: '7.4.1',
      category: EventsCategories.BACK_CINEMATIC,
      event: 'DP_USED_INVALID_CREDENTIAL',
    },

    DP_USED_INVALID_ACCESS_TOKEN: {
      step: '7.4.2',
      category: EventsCategories.BACK_CINEMATIC,
      event: 'DP_USED_INVALID_ACCESS_TOKEN',
    },

    SP_REQUESTED_LOGOUT: {
      step: '8.0.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'SP_REQUESTED_LOGOUT',
    },

    FC_REQUESTED_LOGOUT_FROM_IDP: {
      step: '8.1.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FC_REQUESTED_LOGOUT_FROM_IDP',
      interceptRoutes: [
        {
          method: RequestMethod.ALL,
          path: OidcClientRoutes.DISCONNECT_FROM_IDP,
        },
      ],
    },

    FC_SESSION_TERMINATED: {
      step: '8.2.0',
      category: EventsCategories.FRONT_CINEMATIC,
      event: 'FC_SESSION_TERMINATED',
    },
  },
} as TrackingConfig;
