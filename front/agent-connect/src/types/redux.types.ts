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
  };
  type: string;
};

export type RootState = {
  ministries: Ministry[];
  redirectURL: string;
  serviceProviderName: string;
  identityProvidersHistory: string[];
};
