import { IdentityProvider, Ministry } from '../../../types';

export const groupIdentityProvidersUIDs = (
  previousValues: string[],
  ministry: Ministry,
): string[] => {
  const { identityProviders } = ministry;
  const uids = identityProviders.map(
    (identityProvider: IdentityProvider) => identityProvider.uid,
  );
  return [...previousValues, ...uids];
};

export const filterValidIdentityProvidersUIDs = (
  identityProvidersUIDs: string[],
) => (historyUID: string) => {
  return identityProvidersUIDs.find((uid: string) => uid === historyUID);
};

export const filterIdentityProvidersHistoryByLoadedMinistries = (
  previousState: string[],
  ministries: Ministry[],
) => {
  const identityProvidersUIDs = ministries.reduce(
    groupIdentityProvidersUIDs,
    [],
  );
  const nextState = previousState.filter(
    filterValidIdentityProvidersUIDs(identityProvidersUIDs),
  );
  return nextState;
};
