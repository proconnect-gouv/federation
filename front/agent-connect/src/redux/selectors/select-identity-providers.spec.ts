import {
  getMinistries,
  selectIdentityProviders,
} from './select-identity-providers';

const state = {
  identityProvidersHistory: ['mock-any'],
  ministries: [
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
  ],
  redirectToIdentityProviderInputs: {
    acr_values: 'mock-acr',
    redirectUriServiceProvider: 'mock-redirect',
    response_type: 'mock-type',
    scope: 'mock-scope',
  },
  redirectURL: 'mock-redirect-url',
  serviceProviderName: 'mock-service-provider-name',
};

describe('selectIdentityProviders', () => {
  describe('getMinistries', () => {
    it('should return return the list of ministries', () => {
      const result = getMinistries(state);
      expect(result).toStrictEqual(state.ministries);
    });
  });

  describe('selectIdentityProviders', () => {
    it('should return the identity providers list from the store', () => {
      const expected = [
        { active: true, name: 'mock-name-1.1', uid: 'mock-1.1' },
        { active: true, name: 'mock-name-1.2', uid: 'mock-1.2' },
        { active: true, name: 'mock-name-2.1', uid: 'mock-2.1' },
        { active: true, name: 'mock-name-2.2', uid: 'mock-2.2' },
      ];
      const result = selectIdentityProviders(state);
      expect(result).toStrictEqual(expected);
    });
  });
});
