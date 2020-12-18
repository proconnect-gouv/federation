import { isSearchTermValid, searchIdentityProvidersByTerm, transformIdentityProviderNameToSlug, transformTermToSlug } from './index';

const slugifiedlist = [
  {
    active: true,
    display: true,
    name: '2eme fi intérieur',
    slug: '2eme fi interieur',
    uid: '2eme-fi-interieur',
  },
  {
    active: true,
    display: true,
    name: '1er fi élevé',
    slug: '2eme fi eleve',
    uid: '1er-fi-interieur',
  },
  {
    active: true,
    display: true,
    name: '3eme fi intérieur',
    slug: '3eme fi intérieur',
    uid: '3eme-fi-interieur',
  },
];

describe('IdentityProviderSearchComponent', () => {
  describe('transformTermToSlug', () => {
    it('should return a string without accent', () => {
      // setup
      const term = 'élevé';
      const expected = 'eleve';
      // action
      const result = transformTermToSlug(term);
      // expect
      expect(result).toStrictEqual(expected);
    });
  });

  describe('transformIdentityProviderNameToSlug', () => {
    it('should return a string without accent', () => {
      // setup
      const item = {
        active: true,
        display: true,
        name: '1er fi élevé',
        uid: '1er-fi-interieur',
      };
      // action
      const result = transformIdentityProviderNameToSlug(item);
      // expect
      expect(result).toStrictEqual({
        active: true,
        display: true,
        name: '1er fi élevé',
        slug: '1er fi eleve',
        uid: '1er-fi-interieur',
      });
    });
  });

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

    it('should return false, term length < 3', () => {
      const term = 'ab';
      const result = isSearchTermValid(term);
      expect(result).toBe(false);
    });

    it('should return true, term length === 3', () => {
      const term = 'abc';
      const result = isSearchTermValid(term);
      expect(result).toBe(true);
    });

    it('should return true, term length > 3', () => {
      const term = 'abcdefghijk';
      const result = isSearchTermValid(term);
      expect(result).toBe(true);
    });
  });

  describe('searchIdentityProvidersByTerm', () => {
    it('should return a list of results by a term, insensitive case, insensitive accent', () => {
      // setup
      const term = 'ELEVE';
      // action
      const result = searchIdentityProvidersByTerm(slugifiedlist, term);
      // expect
      expect(result).toStrictEqual([
        {
          active: true,
          display: true,
          name: '1er fi élevé',
          slug: '2eme fi eleve',
          uid: '1er-fi-interieur',
        },
      ]);
    });

    it('should return an empty array, no results', () => {
      // setup
      const term = 'anyterm';
      // action
      const result = searchIdentityProvidersByTerm(slugifiedlist, term);
      // expect
      expect(result).toStrictEqual([]);
    });
  });
});
