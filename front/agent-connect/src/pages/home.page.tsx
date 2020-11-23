/* istanbul ignore file */
import React from 'react';
import { useSelector } from 'react-redux';

import FCAApiContext from '../components/fca-api-context';
import IdentityProviderSearch from '../components/identity-provider-search';
import IdentityProvidersUserHistory from '../components/identity-providers-user-history';
import MinistriesPanels from '../components/ministries-panels';
import ServiceProviderName from '../components/service-provider-name';
import { RootState } from '../types';

const HomePage = (): JSX.Element => {
  const identityProvidersHistory = useSelector(
    (state: RootState) => state.identityProvidersHistory,
  );

  const showUserHistory = identityProvidersHistory?.length > 0;

  return (
    <FCAApiContext>
      <React.Fragment>
        <ServiceProviderName />
        {showUserHistory && <IdentityProvidersUserHistory />}
        <IdentityProviderSearch />
        <MinistriesPanels />
      </React.Fragment>
    </FCAApiContext>
  );
};

export default HomePage;
