import {
  findCurrentIdentityProviderByUID,
  groupIdentityProviders,
  selectIdentityProviderByUID,
  selectIdentityProviderByUIDMemo,
} from './select-identity-provider-by-uid';

const ministries = [
  {
    id: 'mock-ministry-id-1',
    identityProviders: [
      { name: 'mock-name-1.1', uid: 'mock-1.1' },
      { name: 'mock-name-1.2', uid: 'mock-1.2' },
    ],
    name: 'mock-ministry-name-1',
  },
  {
    id: 'mock-ministry-id-2',
    identityProviders: [
      { name: 'mock-name-2.1', uid: 'mock-2.1' },
      { name: 'mock-name-2.2', uid: 'mock-2.2' },
    ],
    name: 'mock-ministry-name-2',
  },
];

describe('selectIdentityProviderByUID', () => {
  describe('findCurrentIdentityProviderByUID', () => {
    it('should return true if UIDs are equals', () => {
      const uid = 'mock-1';
      const identityProvider = {
        name: 'mock-name',
        uid: 'mock-1',
      };
      const result = findCurrentIdentityProviderByUID(uid)(identityProvider);
      expect(result).toBe(true);
    });

    it('should return true if UIDs are not equals', () => {
      const uid = 'mock-1';
      const identityProvider = {
        name: 'mock-name',
        uid: 'mock-2',
      };
      const result = findCurrentIdentityProviderByUID(uid)(identityProvider);
      expect(result).toBe(false);
    });
  });

  describe('groupIdentityProviders', () => {
    it('should group identity providers into a single array', () => {
      const previousValue = [{ name: 'mock-name-1', uid: 'mock-1' }];
      const ministry = {
        id: 'mock-ministry-id',
        identityProviders: [
          { name: 'mock-name-2', uid: 'mock-2' },
          { name: 'mock-name-3', uid: 'mock-3' },
        ],
        name: 'mock-ministry-name',
      };
      const result = groupIdentityProviders(previousValue, ministry);
      const expected = [
        { name: 'mock-name-1', uid: 'mock-1' },
        { name: 'mock-name-2', uid: 'mock-2' },
        { name: 'mock-name-3', uid: 'mock-3' },
      ];
      expect(result).toStrictEqual(expected);
    });
  });

  describe('selectIdentityProviderByUIDMemo', () => {
    it('should return an identityProvider', () => {
      const uid = 'mock-1.1';
      const result = selectIdentityProviderByUIDMemo(ministries, uid);
      expect(result).toStrictEqual({ name: 'mock-name-1.1', uid: 'mock-1.1' });
    });
  });

  describe('selectIdentityProviderByUID', () => {
    it('should call selectIdentityProviderByUIDMemo only one time', () => {
      const uid = 'mock-1.1';
      const state = {
        identityProvidersHistory: [],
        ministries,
        redirectURL: 'mock-url',
        serviceProviderName: 'mock-sp-name',
      };
      const result = selectIdentityProviderByUID(state, uid);
      expect(result).toStrictEqual({ name: 'mock-name-1.1', uid: 'mock-1.1' });
    });
  });
});
