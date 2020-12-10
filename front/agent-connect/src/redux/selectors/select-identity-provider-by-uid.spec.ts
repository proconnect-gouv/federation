import {
  findCurrentIdentityProviderByUID,
  groupIdentityProviders,
  selectIdentityProviderByUID,
} from './select-identity-provider-by-uid';

const ministries = [
  {
    id: 'mock-ministry-id-1',
    identityProviders: [
      { active: true, name: 'mock-name-1.1', uid: 'mock-1.1' },
      { active: true, name: 'mock-name-1.2', uid: 'mock-1.2' },
    ],
    name: 'mock-ministry-name-1',
  },
  {
    id: 'mock-ministry-id-2',
    identityProviders: [
      { active: true, name: 'mock-name-2.1', uid: 'mock-2.1' },
      { active: true, name: 'mock-name-2.2', uid: 'mock-2.2' },
    ],
    name: 'mock-ministry-name-2',
  },
];

describe('selectIdentityProviderByUID', () => {
  describe('findCurrentIdentityProviderByUID', () => {
    it('should return true if UIDs are equals', () => {
      // setup
      const uid = 'mock-1';
      const identityProvider = {
        active: true,
        name: 'mock-name',
        uid: 'mock-1',
      };
      // action
      const result = findCurrentIdentityProviderByUID(uid)(identityProvider);
      // expect
      expect(result).toBe(true);
    });

    it('should return true if UIDs are not equals', () => {
      // setup
      const uid = 'mock-1';
      const identityProvider = {
        active: true,
        name: 'mock-name',
        uid: 'mock-2',
      };
      // action
      const result = findCurrentIdentityProviderByUID(uid)(identityProvider);
      // expect
      expect(result).toBe(false);
    });
  });

  describe('groupIdentityProviders', () => {
    it('should group identity providers into a single array', () => {
      // setup
      const previousValue = [
        { active: true, name: 'mock-name-1', uid: 'mock-1' },
      ];
      const ministry = {
        id: 'mock-ministry-id',
        identityProviders: [
          { active: true, name: 'mock-name-2', uid: 'mock-2' },
          { active: true, name: 'mock-name-3', uid: 'mock-3' },
        ],
        name: 'mock-ministry-name',
      };
      // action
      const result = groupIdentityProviders(previousValue, ministry);
      // expect
      expect(result).toStrictEqual([
        { active: true, name: 'mock-name-1', uid: 'mock-1' },
        { active: true, name: 'mock-name-2', uid: 'mock-2' },
        { active: true, name: 'mock-name-3', uid: 'mock-3' },
      ]);
    });
  });

  describe('selectIdentityProviderByUID', () => {
    it('should call selectIdentityProviderByUIDMemo only one time', () => {
      // setup
      const uid = 'mock-1.1';
      const state = {
        identityProvidersHistory: [],
        ministries,
        redirectToIdentityProviderInputs: {
          acr_values: 'mock-acr',
          redirectUriServiceProvider: 'mock-uri',
          response_type: 'mock-type',
          scope: 'mock-scope',
        },
        redirectURL: 'mock-url',
        serviceProviderName: 'mock-sp-name',
      };
      // action
      const result = selectIdentityProviderByUID(state, uid);
      // expect
      expect(result).toStrictEqual({
        active: true,
        name: 'mock-name-1.1',
        uid: 'mock-1.1',
      });
    });
  });
});
