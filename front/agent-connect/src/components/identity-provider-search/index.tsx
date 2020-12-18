/* istanbul ignore file */

/**
 * @TODO Coverage < 100% -> dette
 * Can not mock FUSE library
 */
import { Form } from 'antd';
import diacritics from 'diacritics';
import Fuse from 'fuse.js';
import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';

import { IdentityProvider, RootState } from '../../types';
import NoSearchResults from './no-search-results';
import SearchInput from './search-input';
import SearchResults from './search-results';

export type SlugifiedIdentityProvider = {
  name: string;
  slug: string;
  uid: string;
  active: boolean;
  display: boolean;
};

const FUSE_SEARCH_OPTIONS = {
  findAllMatches: false,
  ignoreLocation: true,
  includeMatches: false,
  includeScore: false,
  isCaseSensitive: false,
  keys: ['slug'],
  maxPatternLength: 64,
  minMatchCharLength: 3,
  shouldSort: true,
  threshold: 0.3,
};

export const isSearchTermValid = (term: string | undefined): boolean => {
  if (!term || typeof term !== 'string') {
    return false;
  }
  const trimmed = term.trim();
  return trimmed !== '' && trimmed.length >= 3;
};


export const transformTermToSlug = (term: string) => {
  return diacritics.remove(term);
};

export const transformIdentityProviderNameToSlug = (identityProvider: IdentityProvider): SlugifiedIdentityProvider => ({
  ...identityProvider,
  slug: diacritics.remove(identityProvider.name),
});

export const searchIdentityProvidersByTerm = (
  list: SlugifiedIdentityProvider[],
  term: string,
): IdentityProvider[] => {
  const fuse = new Fuse(list, FUSE_SEARCH_OPTIONS);
  const fuseResults = fuse.search(term);
  const results = fuseResults
    .map(fuseResult => fuseResult.item)
    .filter(identityProvider => identityProvider.name && identityProvider.uid);
  return results;
};

const IdentityProviderSearchComponent = React.memo(
  (): JSX.Element => {
    const [searchTerm, setSearchTerm] = useState<string | undefined>();
    const [results, setResults] = useState<IdentityProvider[]>([]);

    const identityProviders = useSelector(
      (state: RootState) => state.identityProviders.map(transformIdentityProviderNameToSlug),
    );

    const onInputChangeHandler = useCallback(
      inputValue => {
        setSearchTerm(inputValue);
        let searchResults: React.SetStateAction<IdentityProvider[]> = [];
        const term = (inputValue && inputValue.trim()) || false;
        if (term) {
          const slug = transformTermToSlug(term);
          searchResults = searchIdentityProvidersByTerm(
            identityProviders,
            slug,
          );
        }
        setResults(searchResults);
      },
      [identityProviders],
    );

    const onSubmitSearchForm = (values: any) => {
      const inputValue = values['fi-search-term'];
      onInputChangeHandler(inputValue);
    };

    const showSearchResults = results.length > 0;
    const showNoSearchResults =
      !showSearchResults && isSearchTermValid(searchTerm);

    return (
      <div className="row text-center mb-8" id="identity-provider-search">
        <Form
          className="w-100"
          layout="vertical"
          size="large"
          onFinish={onSubmitSearchForm}>
          <SearchInput
            label="Je connais le nom de mon fournisseur d'identité"
            name="fi-search-term"
            onChange={onInputChangeHandler}
          />
        </Form>
        {showSearchResults && <SearchResults results={results} />}
        {showNoSearchResults && <NoSearchResults />}
      </div>
    );
  },
);

IdentityProviderSearchComponent.displayName = 'IdentityProviderSearchComponent';

export default IdentityProviderSearchComponent;
