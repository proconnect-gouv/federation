import classnames from 'classnames';
import React from 'react';

import { useAddToUserHistory } from '@fc/agent-connect-history';
import { useSearchResults } from '@fc/agent-connect-search';
import { RedirectToIdpFormComponent } from '@fc/oidc-client';

import styles from './search-results.module.scss';
import { SearchResultsListComponent } from './search-results-list.component';

export const SearchResultsComponent = React.memo(() => {
  const { searchResults, showNoResults, showResults } = useSearchResults();
  const uid = 'uuid';
  const csrfToken = 'csrfToken';

  const addToUserHistory = useAddToUserHistory(uid);

  return (
    <React.Fragment>
      {showResults && <SearchResultsListComponent results={searchResults} />}
      {showNoResults && (
        <div>
          <div className="fr-mx-2w fr-text--lg" id="identity-provider-result">
            <p>Aucun résultat. Vous pouvez vous connecter en utilisant MonComptePro.</p>
          </div>
          <RedirectToIdpFormComponent csrf={csrfToken} id={`fca-search-idp-${uid}`} uid={uid}>
            <button
              aria-label="Se connecter à MonComptePro"
              className={classnames(styles.moncompteprobutton)}
              id={`idp-${uid}-button`}
              type="submit"
              onClick={addToUserHistory}
            />
            <p>
              <a
                href="https://moncomptepro.beta.gouv.fr/"
                rel="noopener noreferrer"
                target="_blank"
                title="Qu’est-ce que MonComptePro ? - nouvelle fenêtre">
                Qu’est-ce que MonComptePro ?
              </a>
            </p>
          </RedirectToIdpFormComponent>
        </div>
      )}
    </React.Fragment>
  );
});

SearchResultsComponent.displayName = 'SearchResultsComponent';
