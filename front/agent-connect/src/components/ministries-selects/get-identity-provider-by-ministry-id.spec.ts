import { getIdentityProvidersByMinistryID } from './get-identity-providers-by-ministry-id';

const ministries = [
  {
    id: 'mock-id-1',
    identityProviders: ['mock-1.1', 'mock-1.2'],
    name: 'mock-name-1',
  },
];

const identityProviders = [
  { active: true, display: true, name: 'mock-name-1.1', uid: 'mock-1.1' },
  { active: true, display: true, name: 'mock-name-1.2', uid: 'mock-1.2' },
  { active: true, display: true, name: 'mock-name-2.1', uid: 'mock-2.1' },
  { active: true, display: true, name: 'mock-name-2.2', uid: 'mock-2.2' },
];

describe('getIdentityProvidersByMinistryID', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should return an array of identity providers by ministry id', () => {
    // setup
    const state = {
      identityProviders,
      identityProvidersHistory: [],
      ministries,
      redirectToIdentityProviderInputs: {
        acr_values: '',
        redirectUriServiceProvider: '',
        response_type: '',
        scope: '',
      },
      redirectURL: '',
      serviceProviderName: '',
    };
    // action
    const result = getIdentityProvidersByMinistryID(state, 'mock-id-1');
    // expect
    const expected = [
      { active: true, display: true, name: 'mock-name-1.1', uid: 'mock-1.1' },
      { active: true, display: true, name: 'mock-name-1.2', uid: 'mock-1.2' },
    ];
    expect(result).toStrictEqual(expected);
  });
});
