import {
  filterIdentityProvidersHistoryByLoadedMinistries,
  filterValidIdentityProvidersUIDs,
  groupIdentityProvidersUIDs,
} from './filter-identity-providers-history';

const loadedMinistriesFromBackend = [
  {
    id: 'mock-id-1',
    identityProviders: [
      {
        name: 'mock-fi-1.1',
        uid: 'mock-1.1',
      },
    ],
    name: 'mock-ministry-1',
  },
  {
    id: 'mock-id-2',
    identityProviders: [
      {
        name: 'mock-fi-2.1',
        uid: 'mock-2.1',
      },
      {
        name: 'mock-fi-2.2',
        uid: 'mock-2.2',
      },
    ],
    name: 'mock-ministry-2',
  },
];

describe('filterIdentityProvidersHistoryByLoadedMinistries', () => {
  describe('groupIdentityProvidersUIDs', () => {
    it("should group all identity providers uid's into an array", () => {
      const previousReduceAccumulator = ['mock-2.2'];
      const [firstMinistry] = loadedMinistriesFromBackend;
      const result = groupIdentityProvidersUIDs(
        previousReduceAccumulator,
        firstMinistry,
      );
      const expected = ['mock-2.2', 'mock-1.1'];
      expect(result).toStrictEqual(expected);
    });
  });

  describe('filterValidIdentityProvidersUIDs', () => {
    it('return the history uid if present in the ministry uids group', () => {
      const currentHistoryUIDs = 'mock-2.2';
      const identityProvidersUIDs = ['mock-2.2', 'mock-1.1'];
      const result = filterValidIdentityProvidersUIDs(identityProvidersUIDs)(
        currentHistoryUIDs,
      );
      const expected = 'mock-2.2';
      expect(result).toStrictEqual(expected);
    });

    it('return undefined if present in the ministry uids group', () => {
      const currentHistoryUIDs = 'mock-not-in-ministry-uids';
      const identityProvidersUIDs = ['mock-2.2', 'mock-1.1'];
      const result = filterValidIdentityProvidersUIDs(identityProvidersUIDs)(
        currentHistoryUIDs,
      );
      const expected = undefined;
      expect(result).toStrictEqual(expected);
    });
  });

  it("should return an array of string, remove user history's uid not loaded/removed ministries from backend", () => {
    const previousState = ['uid-not-loaded', 'mock-2.2'];
    const result = filterIdentityProvidersHistoryByLoadedMinistries(
      previousState,
      loadedMinistriesFromBackend,
    );
    const expected = ['mock-2.2'];
    expect(result).toStrictEqual(expected);
  });
});
