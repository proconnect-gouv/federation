import classnames from 'classnames';
import React, { useContext } from 'react';

import { useAddToUserHistory } from '@fc/agent-connect-history';
import { AgentConnectSearchContext, useSearchResults } from '@fc/agent-connect-search';
import { RedirectToIdpFormComponent } from '@fc/oidc-client';

import styles from './search-results.module.scss';
import { SearchResultsListComponent } from './search-results-list.component';

export const SearchResultsComponent = React.memo(() => {
  const { searchResults, showNoResults, showResults } = useSearchResults();
  const { payload } = useContext(AgentConnectSearchContext);

  // todo: replace this uuid by the one in production?
  const uid = '54a380fd-876e-4cdc-88b5-5da9cf16f357';
  const { csrfToken } = payload;

  const addToUserHistory = useAddToUserHistory(uid);

  return (
    <React.Fragment>
      {showResults && <SearchResultsListComponent results={searchResults} />}
      {showNoResults && (
        <div>
          <div className="fr-mx-2w" id="identity-provider-result">
            <h3 className="fr-text--md">Nous ne trouvons pas votre administration</h3>
            <p className="fr-text--md">Vous pouvez continuer en utilisant MonComptePro</p>
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
