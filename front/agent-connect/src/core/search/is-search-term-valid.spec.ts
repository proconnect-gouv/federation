import isSearchTermValid from './is-search-term-valid';

describe('isSearchTermValid', () => {
  it('should return false, term is undefined', () => {
    const term = undefined;
    const result = isSearchTermValid(term);
    expect(result).toBe(false);
  });

  it('should return false, term is empty string', () => {
    const term = '';
    const result = isSearchTermValid(term);
    expect(result).toBe(false);
  });

  it('should return false, term length < 6', () => {
    const term = 'abcde';
    const result = isSearchTermValid(term);
    expect(result).toBe(false);
  });

  it('should return true, term length === 6', () => {
    const term = 'abcdef';
    const result = isSearchTermValid(term);
    expect(result).toBe(true);
  });

  it('should return true, term length > 6', () => {
    const term = 'abcdefghijk';
    const result = isSearchTermValid(term);
    expect(result).toBe(true);
  });
});
