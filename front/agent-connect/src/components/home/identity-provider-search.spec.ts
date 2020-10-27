import { nonCaseSensitiveSearch } from './identity-provider-search';

const autocompleteOptions = [
  { label: 'option 1', value: 'THIS IS AN USER SEARCH TERM' },
  { label: 'option 2', value: 'bamboo' },
];

describe('identity-provider-search', () => {
  describe('nonCaseSensitiveSearch', () => {
    it("should return true whatever the string's case used", () => {
      const inputValue = 'this is an user';
      const [option] = autocompleteOptions;
      const result = nonCaseSensitiveSearch(inputValue, option);
      expect(result).toBe(true);
    });

    it("should return true whatever the string's case used, the entire string", () => {
      const inputValue = 'this is an user search term';
      const [option] = autocompleteOptions;
      const result = nonCaseSensitiveSearch(inputValue, option);
      expect(result).toBe(true);
    });

    it('should return false search does not include any terms', () => {
      const inputValue = 'this is an user search term';
      const [, option] = autocompleteOptions;
      const result = nonCaseSensitiveSearch(inputValue, option);
      expect(result).toBe(false);
    });
  });
});
