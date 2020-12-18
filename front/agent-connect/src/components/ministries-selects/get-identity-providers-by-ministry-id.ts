import { createCachedSelector } from 're-reselect';

import { RootState } from '../../types';

const getMinistries = (state: RootState) => state.ministries;
const getIdentityProviders = (state: RootState) => state.identityProviders;
const getMinistryID = (_state: RootState, ministryID: string): string =>
  ministryID;

export const getIdentityProvidersByMinistryID = createCachedSelector(
  getMinistries,
  getIdentityProviders,
  getMinistryID,
  (ministries, identityProviders, ministryID) => {
    const ministry = ministries.find(mnstry => mnstry.id === ministryID);
    const results = identityProviders.filter(idp => {
      return ministry?.identityProviders.includes(idp.uid);
    });
    return results;
  },
)(
  (_state, ministryID) =>
    `selector::identity-providers::by::ministry-id::${ministryID}`,
);

export default getIdentityProvidersByMinistryID;
