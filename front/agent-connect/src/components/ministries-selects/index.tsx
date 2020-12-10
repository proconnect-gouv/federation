/* istanbul ignore file */

/**
 * @TODO untested
 */
import './index.scss';

import { Button } from 'antd';
import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';

import { IdentityProvider, Ministry, RootState } from '../../types';
import IdentityProviderSubmit from './identity-provider-submit';
import IdentityProvidersSelect from './identity-providers-select';
import MinistriesSelect from './ministries-select';

function MinistriesSelectsComponent(): JSX.Element {
  const [ministry, setMinistry] = useState<any>();
  const [identityProviders, setIndentityProviders] = useState<any>([]);
  const [identityProvider, setIdentityProvider] = useState<any>();

  const ministries = useSelector((state: RootState) => state.ministries);

  const onMinistrySelectHandler = useCallback(
    (ministryId: string) => {
      const foundMinistry = ministries.find(
        (item: Ministry) => item.id === ministryId,
      );
      const ministryIdentityProviders = foundMinistry?.identityProviders || [];
      setIdentityProvider(null);
      setMinistry(foundMinistry);
      setIndentityProviders(ministryIdentityProviders);
    },
    [ministries],
  );

  const onIdentityProviderSelectHandler = useCallback(
    (identityProviderUID: string) => {
      const providers = ministry.identityProviders;
      const foundIdentityProvider = providers.find(
        (item: IdentityProvider) => item.uid === identityProviderUID,
      );
      setIdentityProvider(foundIdentityProvider);
    },
    [ministry],
  );

  return (
    <section className="row" id="ministries-selects">
      <p className="h4 offset-md-1 col-md-10 col-12">
        Je recherche par administration
      </p>
      <div className="text-center offset-md-1 col-md-10 col-12">
        <MinistriesSelect onSelect={onMinistrySelectHandler} />
        <IdentityProvidersSelect
          identityProviders={identityProviders}
          onSelect={onIdentityProviderSelectHandler}
        />
        {(identityProvider && (
          <IdentityProviderSubmit identityProvider={identityProvider} />
        )) || (
          <Button
            disabled
            className="font-18 mx-auto"
            htmlType="button"
            size="large"
            type="primary">
            OK
          </Button>
        )}
      </div>
    </section>
  );
}

MinistriesSelectsComponent.displayName = 'MinistriesSelectsComponent';

export default MinistriesSelectsComponent;
