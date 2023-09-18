import React from 'react';

import { IdentityProvider, useSearchResults } from '@fc/agent-connect-search';

import { MONCOMPTEPRO_UID, NoResultComponent } from './no-result.component';
import { SearchResultsListComponent } from './search-results-list.component';


export const SearchResultsComponent = React.memo(() => {
  const { searchResults, showNoResults, showResults } = useSearchResults();

  /* istanbul ignore next */
  const isMoncompteProAvailable = () => {
    const moncomptepro = (identityProviders: IdentityProvider[]): IdentityProvider | null => identityProviders.map(
      idp => (idp.uid === MONCOMPTEPRO_UID) ? idp: null).filter(n => n)[0];

    /* istanbul ignore next */
    return (
      moncomptepro
      && (moncomptepro as unknown as IdentityProvider).active
      && (moncomptepro as unknown as IdentityProvider).display
    )
  }

  return (
    <React.Fragment>
      {showResults && <SearchResultsListComponent results={searchResults} />}
      {showNoResults && <NoResultComponent isMoncompteProAvailable={isMoncompteProAvailable()} />}
    </React.Fragment>
  );
});

SearchResultsComponent.displayName = 'SearchResultsComponent';
