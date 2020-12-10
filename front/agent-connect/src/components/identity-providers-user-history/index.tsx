import './index.scss';

import React from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../types';
import IdentityProviderCard from './identity-provider-card';

const IdentityProvidersUserHistoryComponent = React.memo(
  (): JSX.Element => {
    const identityProvidersHistory = useSelector(
      (state: RootState) => state.identityProvidersHistory,
    );
    return (
      <div className="mb-8" id="identity-providers-user-history">
        <div className="text-center mb-4">
          <span className="h4 font-weight-bold">J&apos;utilise à nouveau</span>
        </div>
        <div className="d-flex flex-wrap flex-row justify-content-center col-md-12 col-sm-12 wrapper">
          {identityProvidersHistory.map((identityProviderUID: string) => (
            <IdentityProviderCard
              key={identityProviderUID}
              uid={identityProviderUID}
            />
          ))}
        </div>
      </div>
    );
  },
);

IdentityProvidersUserHistoryComponent.displayName =
  'IdentityProvidersUserHistoryComponent';

export default IdentityProvidersUserHistoryComponent;
