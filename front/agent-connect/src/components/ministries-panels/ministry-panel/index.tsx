/* istanbul ignore file */
// untested dette
import { Collapse } from 'antd';
import React from 'react';

import { IdentityProvider, Ministry } from '../../../types';
import IdentityProviderButton from './identity-provider-button';
import MinistryName from './ministry-name';

type PanelProps = {
  ministry: Ministry;
};

function PanelComponent({ ministry, ...props }: PanelProps): JSX.Element {
  const { id, identityProviders, name } = ministry;
  return (
    <Collapse.Panel
      key={id}
      showArrow
      {...props}
      className="mb-4 p-2 border border-primary rounded"
      header={<MinistryName name={name} />}>
      <ul className="font-18 px-3">
        {identityProviders.map((identityProvider: IdentityProvider) => {
          const { uid } = identityProvider;
          return (
            <li key={uid} className="mb-2">
              <IdentityProviderButton identityProvider={identityProvider} />
            </li>
          );
        })}
      </ul>
    </Collapse.Panel>
  );
}

export default PanelComponent;
