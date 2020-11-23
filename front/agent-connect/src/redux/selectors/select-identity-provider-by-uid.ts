/* istanbul ignore file */
// unable to spy selectIdentityProviderByUID::selectIdentityProviderByUIDMemo
import { createCachedSelector } from 're-reselect';

import { IdentityProvider, Ministry, RootState } from '../../types';

const getMinistries = (state: RootState): Ministry[] => state.ministries;
const getUID = (_state: RootState, uid: string): string => uid;

export const groupIdentityProviders = (
  previousValue: IdentityProvider[],
  ministry: Ministry,
) => {
  const { identityProviders } = ministry;
  return [...previousValue, ...identityProviders];
};

export const findCurrentIdentityProviderByUID = (uid: string) => (
  identityProvider: IdentityProvider,
) => identityProvider.uid === uid;

export const selectIdentityProviderByUIDMemo = (
  ministries: Ministry[],
  uid: string,
): IdentityProvider | undefined => {
  const providers = ministries.reduce(groupIdentityProviders, []);
  const found = providers.find(findCurrentIdentityProviderByUID(uid));
  return found;
};

export const selectIdentityProviderByUID = createCachedSelector(
  getMinistries,
  getUID,
  selectIdentityProviderByUIDMemo,
)((_state, uid) => `ministry::identityProvider::${uid}`);
