import addIdentityProvider from './add-identity-provider';

describe('addIdentityProvider', () => {
  it('should return an array, but will not add the name if already contained in the array', () => {
    const name = 'mock-name';
    const previousState = ['mock-1', 'mock-2', 'mock-name'];
    const result = addIdentityProvider(previousState, name);
    const expected = ['mock-name', 'mock-1', 'mock-2', 'mock-name'];
    expect(result).not.toStrictEqual(expected);
  });

  it('should return an array with a max length of 3 ', () => {
    const name = 'mock-name';
    const previousState = ['mock-1', 'mock-2', 'mock-3', 'mock-4'];
    const result = addIdentityProvider(previousState, name);
    const expected = ['mock-name', 'mock-1', 'mock-2'];
    expect(result).toStrictEqual(expected);
  });

  it('should return an array and add the name at the beginning of the array', () => {
    const name = 'mock-name';
    const previousState = ['mock-1', 'mock-2'];
    const result = addIdentityProvider(previousState, name);
    const expected = ['mock-name', 'mock-1', 'mock-2'];
    expect(result).toStrictEqual(expected);
  });
});
