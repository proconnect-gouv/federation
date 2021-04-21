import React from 'react';
import { useSelector } from 'react-redux';

import { Ministry, RootState } from '../../types';
import ResultItem from './result-item';

type SearchResultsProps = {
  results: Ministry[];
};

const SearchResultsComponent = React.memo(
  ({ results }: SearchResultsProps): JSX.Element => {
    const identityProviders = useSelector(
      (_: RootState) => _.identityProviders,
    );
    return (
      <div
        className="offset-md-1 col-md-10 col-12 text-left"
        id="identity-provider-result">
        {results.map(
          ({ id: ministryId, identityProviders: idps, name: ministryName }) => {
            const selected = identityProviders.filter(idp =>
              idps.includes(idp.uid),
            );
            return (
              <dl key={ministryId} id={`ministry-${ministryId}-search-list`}>
                <dt>{ministryName}</dt>
                <dd>
                  {identityProviders.length > 0 ? (
                    <ul className="unordered-list">
                      {selected.map(idp => (
                        <li key={`${ministryId}::${idp.uid}`}>
                          <ResultItem identityProvider={idp} />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="bg-blue-cornflower font-5 p-2 my-2">
                      Cette administration n&apos;est pas encore reliée à
                      AgentConnect pour cette application
                    </p>
                  )}
                </dd>
              </dl>
            );
          },
        )}
      </div>
    );
  },
);

SearchResultsComponent.displayName = 'SearchResultsComponent';

export default SearchResultsComponent;
