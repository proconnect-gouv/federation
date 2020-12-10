import { IdentityProvider } from '../../types';
import { isSearchTermValid, searchIdentityProvidersByTerm } from './index';

const list = [
  {
    active: true,
    name: '2eme fi intérieur',
    uid: '2eme-fi-interieur',
  },
  {
    active: true,
    name: '1er fi intérieur',
    uid: '1er-fi-interieur',
  },
  {
    active: true,
    name: '3eme fi intérieur',
    uid: '3eme-fi-interieur',
  },
  {
    active: true,
    name: 'toto',
    uid: 'toto',
  },
];

describe('IdentityProviderSearchComponent', () => {
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
    it('should return a list of results by a term, insensitive case', () => {
      // setup
      const term = 'TOTO';
      const searchlist = [
        ...list,
        {
          active: true,
          name: 'supertoto',
          uid: 'supertoto',
        },
      ];
      // action
      const result = searchIdentityProvidersByTerm(searchlist, term);
      // expect
      expect(result).toStrictEqual([
        { active: true, name: 'toto', uid: 'toto' },
        { active: true, name: 'supertoto', uid: 'supertoto' },
      ]);
    });

    it('should return an empty array, identity providers a key is not valid', () => {
      // setup
      const term = 'mock-name';
      const searchlist = ([
        {
          name: 'mock-name',
          notAValidUIDKey: 'mock-uid',
        },
      ] as unknown) as IdentityProvider[];
      // action
      const result = searchIdentityProvidersByTerm(searchlist, term);
      // expect
      expect(result).toStrictEqual([]);
    });

    it('should return an empty array, no results', () => {
      // setup
      const term = 'anyterm';
      const searchlist = [
        ...list,
        {
          active: true,
          name: 'toto',
          uid: 'toto',
        },
      ];
      // action
      const result = searchIdentityProvidersByTerm(searchlist, term);
      // expect
      expect(result).toStrictEqual([]);
    });
  });
});
