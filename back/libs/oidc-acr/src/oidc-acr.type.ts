import { UnknownObject } from 'oidc-provider';

export type SimplifiedInteraction = {
  uid: string;
  params: {
    acr_values: string;
    client_id: string;
    redirect_uri: string;
    state: string;
    idp_hint: string;
    login_hint: string;
  };
  prompt: {
    name: 'login' | 'consent' | string;
    reasons: string[];
    details:
      | {
      acr: {
        essential: boolean;
        value?: string;
        values?: string[];
      };
    }
      | UnknownObject;
  };
};

export type AcrValues = string;

export type AcrClaims = {
  essential: true;
  value?: string;
  values?: string[];
};
