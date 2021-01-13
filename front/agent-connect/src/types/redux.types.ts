/* istanbul ignore file */

// declarative file
import { ActionCreator, AnyAction } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';

// prettier-ignore
export type ThunkActionType = ActionCreator<ThunkAction<Promise<any>, RootState, null, AnyAction>>;

export type ThunkDispatchType = ThunkDispatch<RootState, null, AnyAction>;

export type IdentityProvidersHistoryAction = { payload: string; type: string };

export type IdentityProvider = {
  name: string;
  uid: string;
  active: boolean;
  display: boolean;
};

export type Ministry = {
  id: string;
  identityProviders: string[];
  name: string;
};

export type IdentityProviderFormInputs = {
  acr_values: string;
  redirectUriServiceProvider: string;
  response_type: string;
  scope: string;
};

export type RootState = {
  ministries: Ministry[];
  identityProviders: IdentityProvider[];
  redirectURL: string;
  serviceProviderName: string;
  identityProvidersHistory: string[];
  redirectToIdentityProviderInputs: IdentityProviderFormInputs;
};
