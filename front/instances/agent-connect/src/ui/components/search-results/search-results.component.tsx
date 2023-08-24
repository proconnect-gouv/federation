import React from 'react';

import { useSearchResults } from '@fc/agent-connect-search';

import { SearchResultsListComponent } from './search-results-list.component';

export const SearchResultsComponent = React.memo(() => {
  const { searchResults, showNoResults, showResults } = useSearchResults();
  return (
    <React.Fragment>
      {showResults && <SearchResultsListComponent results={searchResults} />}
      {showNoResults && (
        <div>
          <div className="fr-mx-2w fr-text--lg" id="identity-provider-result">
            Aucun résultat. Vous pouvez vous connecter en utilisant MonComptePro.
          </div>
          <div>[ajouter le bouton MCP]</div>
        </div>

      )}
    </React.Fragment>
  );
});

SearchResultsComponent.displayName = 'SearchResultsComponent';
