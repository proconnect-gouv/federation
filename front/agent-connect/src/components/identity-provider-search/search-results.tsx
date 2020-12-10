import React from 'react';

import { IdentityProvider } from '../../types';
import SearchResultButton from './search-result-button';

type SearchResultsProps = {
  results: IdentityProvider[];
};

const SearchResultsComponent = React.memo(
  ({ results }: SearchResultsProps): JSX.Element => {
    return (
      <dl className="col-10 offset-1 text-left">
        <dt className="font-weight-bold h5">Suggestions&nbsp;:</dt>
        <dd>
          <ul className="list-unstyled">
            {results.map((identityProvider: IdentityProvider) => (
              <li key={identityProvider.uid}>
                <SearchResultButton identityProvider={identityProvider} />
              </li>
            ))}
          </ul>
        </dd>
      </dl>
    );
  },
);

SearchResultsComponent.displayName = 'SearchResultsComponent';

export default SearchResultsComponent;
