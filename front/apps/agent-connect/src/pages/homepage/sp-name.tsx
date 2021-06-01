/* istanbul ignore file */

/**
 * Tested with cypress snapshots
 */
import React from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../types';

const ServiceProviderNameComponent = React.memo(
  (): JSX.Element => {
    const serviceProviderName = useSelector(
      (state: RootState) => state.serviceProviderName,
    );

    return (
      <section className="row mt-5 mb-5 text-center">
        <p className="h4 col-12">Je choisis un compte pour me connecter sur</p>
        <h1 className="col-12 text-center font-weight-bold text-primary">
          <span>{serviceProviderName}</span>
        </h1>
      </section>
    );
  },
);

ServiceProviderNameComponent.displayName = 'ServiceProviderNameComponent';

export default ServiceProviderNameComponent;
