import React from 'react';

import { isSearchTermValid } from '../../core/search';
import { Ministry } from '../../types';
import ResultsList from './results-list';

type SearchResultsProps = {
  term: string | undefined;
  results: Ministry[];
};

const SearchResultsComponent = ({
  results,
  term,
}: SearchResultsProps): JSX.Element => {
  const hasResults = results.length > 0;
  const showNoSearchResults = isSearchTermValid(term) && !hasResults;

  return (
    <React.Fragment>
      {hasResults && <ResultsList results={results} />}
      {showNoSearchResults && (
        <div className="col-10 offset-1 text-left">
          Aucun fournisseur d&apos;identités n&apos;a été trouvé
        </div>
      )}
    </React.Fragment>
  );
};

SearchResultsComponent.displayName = 'SearchResultsComponent';

export default SearchResultsComponent;
