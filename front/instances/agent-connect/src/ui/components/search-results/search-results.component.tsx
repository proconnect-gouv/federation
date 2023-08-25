import classnames from 'classnames';
import React from 'react';

import { useSearchResults } from '@fc/agent-connect-search';

import styles from './search-results.module.scss';
import { SearchResultsListComponent } from './search-results-list.component';


export const SearchResultsComponent = React.memo(() => {
  const { searchResults, showNoResults, showResults } = useSearchResults();
  return (
    <React.Fragment>
      {showResults && <SearchResultsListComponent results={searchResults} />}
      {showNoResults && (
        <div>
          <div className="fr-mx-2w fr-text--lg" id="identity-provider-result">
            <p>Aucun résultat. Vous pouvez vous connecter en utilisant MonComptePro.</p>
          </div>
          <div>
            <button aria-label="Se connecter à MonComptePro" className={classnames(styles.moncompteprobutton)}/>
            <p>
              <a href="https://moncomptepro.beta.gouv.fr/" rel="noopener noreferrer" target="_blank"
                title="Qu’est-ce que MonComptePro ? - nouvelle fenêtre">
                Qu’est-ce que MonComptePro ?
              </a>
            </p>
          </div>
        </div>

      )}
    </React.Fragment>
  );
});

SearchResultsComponent.displayName = 'SearchResultsComponent';
