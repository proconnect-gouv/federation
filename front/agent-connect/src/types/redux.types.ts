/* istanbul ignore file */
// declarative file
import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';

export type ThunkActionType<ReturnType = void> = ThunkAction<
ReturnType,
RootState,
unknown,
Action<string>
>;

export type IdentityProvidersHistoryAction = { payload: string; type: string };

export type IdentityProvider = {
  name: string;
  uid: string;
  active: boolean;
};

export type IdentityProviderFormInputs = {
  acr_values: string;
  redirectUriServiceProvider: string;
  response_type: string;
  scope: string;
};

export type Ministry = {
  id: string;
  identityProviders: IdentityProvider[];
  name: string;
};

export type MinistryListAction = {
  payload: {
    serviceProviderName: string;
    redirectURL: string;
    providers: Ministry[];
    redirectToIdentityProviderInputs: IdentityProviderFormInputs;
  };
  type: string;
};

export type RootState = {
  ministries: Ministry[];
  redirectURL: string;
  serviceProviderName: string;
  identityProvidersHistory: string[];
  redirectToIdentityProviderInputs: IdentityProviderFormInputs;
};
