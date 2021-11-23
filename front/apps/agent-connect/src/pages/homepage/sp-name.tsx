/* istanbul ignore file */

/**
 * Tested with cypress snapshots
 */
import React from 'react';
import classNames from 'classnames'
import { useMediaQuery } from 'react-responsive';
import { useSelector } from 'react-redux';

import { RootState } from '../../types';

const ServiceProviderNameComponent = React.memo((): JSX.Element => {
  const gtTablet = useMediaQuery({ query: '(min-width: 768px)' });

  const serviceProviderName = useSelector(
    (state: RootState) => state.serviceProviderName,
  );

  return (
    <section className={classNames("row", { "text-center": gtTablet})}>
      <h1 className="fs32 mx16 mb16">
        Je choisis un compte pour me connecter sur
      </h1>
      <h2 className="fs40 is-extra-bold is-blue-agentconnect mx16 mb32">
        <span>{serviceProviderName}</span>
      </h2>
    </section>
  );
});

ServiceProviderNameComponent.displayName = 'ServiceProviderNameComponent';

export default ServiceProviderNameComponent;
