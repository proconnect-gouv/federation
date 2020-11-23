import removeIdentityProvider from './remove-identity-provider';

describe('removeIdentityProvider', () => {
  it('should return an array and remove the name provided in parameters from previous array state, previous state is empty', () => {
    const name = 'mock-name';
    const previousState = [];
    const result = removeIdentityProvider(previousState, name);
    const expected = [];
    expect(result).toStrictEqual(expected);
  });

  it('should return an array and remove the name provided in parameters from previous array state, previous state does not contains the name', () => {
    const name = 'mock-name';
    const previousState = ['mock-1', 'mock-2'];
    const result = removeIdentityProvider(previousState, name);
    const expected = ['mock-1', 'mock-2'];
    expect(result).toStrictEqual(expected);
  });

  it('should return an array and remove the name provided in parameters from previous array state, previous state contains the name', () => {
    const name = 'mock-name';
    const previousState = ['mock-1', 'mock-2', 'mock-name'];
    const result = removeIdentityProvider(previousState, name);
    const expected = ['mock-1', 'mock-2'];
    expect(result).toStrictEqual(expected);
  });
});
