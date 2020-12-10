/* istanbul ignore file */

/**
 * @TODO Coverage < 100% -> dette
 * Can not mock FUSE library
 */
import { Form } from 'antd';
import Fuse from 'fuse.js';
import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';

import { selectIdentityProviders } from '../../redux/selectors';
import { IdentityProvider } from '../../types';
import NoSearchResults from './no-search-results';
import SearchInput from './search-input';
import SearchResults from './search-results';

const FUSE_SEARCH_OPTIONS = {
  findAllMatches: false,
  ignoreLocation: true,
  includeMatches: false,
  includeScore: false,
  isCaseSensitive: false,
  keys: ['name'],
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

export const searchIdentityProvidersByTerm = (
  list: IdentityProvider[],
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
    const identityProviders = useSelector(selectIdentityProviders);

    const onInputChangeHandler = useCallback(
      inputValue => {
        setSearchTerm(inputValue);
        let searchResults: React.SetStateAction<IdentityProvider[]> = [];
        const term = (inputValue && inputValue.trim()) || false;
        if (term) {
          searchResults = searchIdentityProvidersByTerm(
            identityProviders,
            term,
          );
        }
        setResults(searchResults);
      },
      [identityProviders],
    );

    const showSearchResults = results.length > 0;
    const showNoSearchResults =
      !showSearchResults && isSearchTermValid(searchTerm);
    return (
      <div className="row text-center mb-8" id="identity-provider-search">
        <Form
          className="w-100"
          layout="vertical"
          size="large"
          onFinish={values => {
            const inputValue = values['fi-search-term'];
            onInputChangeHandler(inputValue);
          }}>
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
