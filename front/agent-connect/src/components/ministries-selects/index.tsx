/* istanbul ignore file */

/**
 * @TODO untested
 */
import './index.scss';

import React, { useCallback, useEffect, useState } from 'react';

import IdentityProviderSubmit from './identity-provider-submit';
import IdentityProvidersSelect from './identity-providers-select';
import MinistriesSelect from './ministries-select';

function MinistriesSelectsComponent(): JSX.Element {
  const [ministryID, setMinistryID] = useState<any>();
  const [identityProviderUID, setIdentityProviderUID] = useState<any>();

  const onSelectMinistryHandler = useCallback(mnstryID => {
    setMinistryID(mnstryID);
  }, []);

  // reset identity provider ui on minstry changes
  useEffect(() => setIdentityProviderUID(null), [ministryID]);

  return (
    <section className="row" id="ministries-selects">
      <p className="h4 offset-md-1 col-md-10 col-12">
        Je recherche par administration
      </p>
      <div className="text-center offset-md-1 col-md-10 col-12">
        <MinistriesSelect onSelect={onSelectMinistryHandler} />
        <IdentityProvidersSelect
          ministryID={ministryID}
          onSelect={setIdentityProviderUID}
        />
        <IdentityProviderSubmit uid={identityProviderUID} />
      </div>
    </section>
  );
}

MinistriesSelectsComponent.displayName = 'MinistriesSelectsComponent';

export default MinistriesSelectsComponent;
