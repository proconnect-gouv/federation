import { Provider, UnknownObject } from "oidc-provider";

type Interaction = Awaited<ReturnType<Provider["interactionDetails"]>>;

export interface ExtendedInteraction extends Interaction {
  params: {
    acr_values?: string;
    client_id: string;
    redirect_uri: string;
    state: string;
    idp_hint: string;
    login_hint: string;
    siret_hint: string;
    // a non-negative integer, as a string: oidc-provider checks it at /authorize
    max_age?: string;
  };
  prompt: {
    name: "login" | "consent" | string;
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
}

export type AcrValues = string;

export type AcrClaims = {
  essential: true;
  value?: string;
  values?: string[];
};
