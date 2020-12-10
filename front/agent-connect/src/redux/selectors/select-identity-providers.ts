import { createSelector } from 'reselect';

import { IdentityProvider, Ministry, RootState } from '../../types';

export const getMinistries = (state: RootState) => state.ministries;

export const selectIdentityProviders = createSelector(
  getMinistries,
  ministries => {
    const identityProviders = ministries.reduce(
      (acc: IdentityProvider[], ministry: Ministry) => {
        return [...acc, ...ministry.identityProviders];
      },
      [],
    );
    return identityProviders;
  },
);
