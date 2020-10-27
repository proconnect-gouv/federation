/* istanbul ignore file */
import React, { Fragment } from 'react';

import IdentityProviderList from '../components/home/identity-provider-list';
import IdentityProviderSearch from '../components/home/identity-provider-search';
import ServiceProviderName from '../components/home/service-provider-name';

const HomePage = (): JSX.Element => {
  return (
    <Fragment>
      <ServiceProviderName />
      <IdentityProviderSearch />
      <IdentityProviderList />
    </Fragment>
  );
};

export default HomePage;
